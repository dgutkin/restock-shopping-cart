
const useDataApi = (url) => {

    const {useReducer} = React;
    const [state, dispatch] = useReducer(dataFetchReducer, []);

    const fetchData = async () => {
        console.log("running doFetch...")
        try {
            const result = await axios(url);
            dispatch({ type: "FETCH_SUCCESS" , payload: result.data.data});
        } catch (error) {
            dispatch({ type: "FETCH_FAILURE" });
        }
    }
    
    return ([state, fetchData]);

}

const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return [...state];
      case "FETCH_SUCCESS":
        let clean = action.payload.map((item) => {return item.attributes});
        return clean;
      case "FETCH_FAILURE":
        return [...state];
      default:
        throw new Error();
    }
  };

const Products = (props) => {

    const { useState, useEffect, useReducer } = React;

    // set state
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    // import React Bootstrap components
    const {
        Card,
        Accordion,
        Button,
        Container,
        Row,
        Col,
        Image,
        Input,
    } = ReactBootstrap;

    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
    const query = "http://localhost:1337/api/products"

    const [data, doFetch] = useDataApi(query);

    // fetch the stock data on mount
    useEffect(() => {
        console.log("fetching initial data...")
        doFetch();   
    }, []);

    // once the data pulled changes, update items
    useEffect(() => {
        setItems([...items, ...data]);
    }, [data]);

    // add to cart function
    const addToCart = (e) => {

        let name = e.target.name;
        let item = items.filter((item) => item.name == name);
        console.log(`add to Cart ${JSON.stringify(item)}`);
        setCart([...cart, ...item]);
        
        let newItems = items;
        newItems.map((i) => {
          if (i.name == name) i.instock--
        });
        
        setItems(newItems);
      };

    // remove from cart function
    const deleteCartItem = (index, name) => {
        let newCart = cart.filter((item, i) => index != i);
        setCart(newCart);
        let newItems = items;
        newItems.map((i) => {
          if (i.name == name) i.instock++
        });
        // console.log(newItems);
        setItems(newItems);
    
      };

    // calculate the checkout total
    const checkOut = () => {
        let costs = cart.map((item) => item.cost);
        const reducer = (accum, current) => accum + current;
        let newTotal = costs.reduce(reducer, 0);
        console.log(`total updated to ${newTotal}`);
        return newTotal;
    };

    // restock products
    const restockProducts = (url) => {
        console.log("restocking...")
        doFetch();
    }

    // construct product list
    let productList = items.map((item, index) => {
        
        return (
          <li key={index}>
            <Card className="mb-2">
              <Row>
                <Col>
                  <Card.Img variant="top" src={photos[index % 4]} width={30}/>
                </Col>
                <Col>
                <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>Cost:{item.cost}, Stock:{item.instock}</Card.Text>
                <Button name={item.name} onClick={addToCart}>Add</Button>
              </Card.Body>
                </Col>
              </Row>
            </Card>
          </li>
        );

      });

    // construct cart list
    let cartList = cart.map((item, index) => {

        return (
          <Accordion.Item key={1+index} eventKey={1 + index}>
          <Accordion.Header>
            {item.name}
          </Accordion.Header>
          <Accordion.Body onClick={() => deleteCartItem(index, item.name)}
            eventKey={1 + index}>
            $ {item.cost} from {item.country}
          </Accordion.Body>
        </Accordion.Item>
        );

      });

    // construct checkout list
    let checkoutList = () => {
        let total = checkOut();
        let final = cart.map((item, index) => {
          return (
            <div key={index} index={index}>
              {item.name}
            </div>
          );
        });
        return { final, total };
      };

    return (

        <Container fluid>
            <Row>
                <Col id="product-col">
                    <h3>Product List</h3>
                    <ul style={{ listStyleType: "none" }}>{productList}</ul>
                </Col>
                <Col id="cart-col">
                    <h3>Cart Contents</h3>
                    <Accordion defaultActiveKey="0">{cartList}</Accordion>
                </Col>
                <Col id="checkout-col">
                    <h3>CheckOut </h3>
                    <Button onClick={checkOut}>CheckOut $ {checkoutList().total}</Button>
                    <div> {checkoutList().total > 0 && checkoutList().final} </div>
                </Col>
            </Row>
            <Row>
                <form
                onSubmit={(event) => {
                    restockProducts(query);
                    console.log(`Restock called on ${query}`);
                    event.preventDefault();
                }}
                >
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit">ReStock Products</button>
                </form>
            </Row>
        </Container>

    );

}





















ReactDOM.render(<Products />, document.getElementById("root"));