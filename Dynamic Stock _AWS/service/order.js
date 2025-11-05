class OrderBook {
    constructor(symbol = "BITCUSD") {
        this.symbol = symbol,
        this.bids = [],
        this.ask = [],
        this._nextId = 1,
        this.lastTradedPrice = null
    }
    // helper
    _genOrderId() {
        return this._nextId++;
    }

    _sort(sides) {
        if (sides === "BUY") {
            this.bids.sort((a, b) => {
                if (a.price != b.price) {
                    return b.price - a.price
                }
                return a.timestamp - b.timestamp;
            })
        } else {
            this.ask.sort((a, b) => {
                if (a.price != b.price) {
                    return a.price - b.price
                }
                return a.timestamp - b.timestamp;
            })

        }
    }

    // function to place a new order in orderbook
    /*
        1. create new order {orderId, side, type, price?, orignqty, remainingqty, execqty, timestamp, user}
        2. match type if type == market, call marketMatch, else call limitMatch
    */

    placeOrder(side, type, price = null, quantity, user) {
        /* Basic validation */
        let order = {
            orderId: this._genOrderId(),
            // symbol: this.symbol,
            side: side,
            type: type,
            price: price,
            orignQty: quantity,
            remainQty: quantity,
            execQty: 0,
            timestamp: Date.now(),
            user: user
        }
        // let trades = []
        if (type === "MARKET") {
            let result = this._marketMatch(order);
            if (result.remainQty > 0) {
                console.log("order completed: " + result.execQty + " " + "cancelled order: " + result.remainQty)
            }
        } else {
            let result = this._limitMatch(order);
        }
    }

    // execute order if it is a market order
    /*
        bids : [] sorted descending,
        ask : [] sorted ascending
        1. type : buy | sell
        2. if buy start buying from ask array starting from index 0.
            loop while order.remainingQty > 0 && ask.length > 0
            buy min(order.remainingQty, ask[0].remainingQty)
            update remainingQty and executedQty from both sides
        3. if sell
    */
    _marketMatch(order) {
        if (order.side === "BUY") {
            let asksArr = this.ask
            let top = asksArr[0]
            while (order.remainQty > 0 && asksArr.length > 0) {
                top = asksArr[0]
                let orderfill = Math.min(order.remainQty, top.remainQty);
                order.execQty = order.execQty + orderfill
                order.remainQty = order.remainQty - orderfill
                top.execQty = top.execQty + orderfill
                top.remainQty = top.remainQty - orderfill

                // assume order.remaining > 0
                if (top.remainQty == 0) {
                    asksArr.shift()
                }
            }
            return {order}
        } else if (order.side === "SELL") {
            let bidsArr = this.bids
            let top = bidsArr[0]
            while (order.remainQty > 0 && bidsArr.length > 0) {
                top = bidsArr[0]
                let orderfill = Math.min(order.remainQty, top.remainQty);
                order.execQty = order.execQty + orderfill
                order.remainQty = order.remainQty - orderfill
                top.execQty = top.execQty + orderfill
                top.remainQty = top.remainQty - orderfill

                // assume order.remaining > 0
                if (top.remainQty == 0) {
                    bidsArr.shift()
                }
            }
            return {order}
        }
    }

    // execute order if it is a limit order
    _limitMatch(order) {
        if (order.side === "BUY") {
            let opposite = this.ask;
            while (order.remainQty > 0 && opposite.length > 0) {
                let top = opposite[0];
                if (order.price >= top.price) {
                    let filledOrder = Math.min(order.remainQty, top.remainQty);
                    order.remainQty -= filledOrder;
                    order.execQty += filledOrder;
                    top.remainQty -= filledOrder;
                    top.execQty += filledOrder;
                    if (top.remainQty <= 0) {
                        opposite.shift();
                    }
                } else {
                    break
                }
            }
            if (order.remainQty > 0) {
                this.bids.push(order)
                this._sort("BUY");
            }
        } else if (order.side === "SELL") {
            let opposite = this.bids;
            while (order.remainQty > 0 && opposite.length > 0) {
                let top = opposite[0];
                if (order.price <= top.price) {
                    let filledOrder = Math.min(order.remainQty, top.remainQty);
                    order.remainQty -= filledOrder;
                    order.execQty += filledOrder;
                    top.remainQty -= filledOrder;
                    top.execQty += filledOrder;
                    if (top.remainQty <= 0) {
                        opposite.shift();
                    }
                } else {
                    break
                }
            }
            if (order.remainQty > 0) {
                this.ask.push(order)
                this._sort("SELL");
            }
        }
    }

    getBookSnapShot() {
        return {
            lastUpdated: Date.now(),
            bids: this.bids.map((o) => [o.price, o.remainQty]),
            ask: this.ask.map((o) => [o.price, o.remainQty]),
            // currentPrice:
        }
    }
}

// if a function or variable start with _ (private)
// let orderBook = new OrderBook("BITCUSD")
// let BITCUSDOrderBook = new OrderBook()
// BITCUSDOrderBook.bids.push({orderId:2, side:"BUY", type:"MARKET", price:100, quantity:10, timestamp:Date.now(), user:"Trishna"})

// BITCUSDOrderBook.bids.push({orderId:3, side:"BUY", type:"MARKET", price:98, quantity:10, timestamp:Date.now(), user:"Saanvi"})

// BITCUSDOrderBook.bids.push({orderId:4, side:"BUY", type:"MARKET", price:99, quantity:10, timestamp:Date.now(), user:"abc"})

// BITCUSDOrderBook._sort("BUY")
// console.log(BITCUSDOrderBook.bids)

// BITCUSDOrderBook.ask.push({orderId:5, side:"SELL", type:"MARKET", price:1500, quantity:7, timestamp:Date.now(), user:"Trishnat"})

// BITCUSDOrderBook.ask.push({orderId:6, side:"SELL", type:"MARKET", price:1505, quantity:2, timestamp:Date.now(), user:"Kriti"})

// BITCUSDOrderBook.ask.push({orderId:7, side:"SELL", type:"MARKET", price:1506, quantity:3, timestamp:Date.now(), user:"xyz"})

// BITCUSDOrderBook._sort("ASK")
// console.log(BITCUSDOrderBook.ask)
// console.log(BITCUSDOrderBook.bids)

// let BITCUSDOrderBook = new OrderBook()
// // fill bids as market maker
// console.log(BITCUSDOrderBook.getBookSnapShot());
// BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1500.00", 10, "trishna")
// BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1506.00", 10, "XYZ")
// BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1505.00", 20, "ABC")
// console.log(BITCUSDOrderBook.getBookSnapShot());

// // fill ask as market maker
// console.log(BITCUSDOrderBook.getBookSnapShot());
// BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1507.00", 10, "trishna")
// BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1508.00", 10, "XYZ")
// BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1509.00", 10, "ABC")
// console.log(BITCUSDOrderBook.getBookSnapShot());

let BITCUSDOrderBook = new OrderBook()

// fill bids as market maker
console.log(BITCUSDOrderBook.getBookSnapShot());
BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1500.00", 10, "Trishna")
BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1506.00", 10, "XYZ")
BITCUSDOrderBook.placeOrder("BUY", "LIMIT", "1505.00", 20, "ABC")
console.log(BITCUSDOrderBook.getBookSnapShot());

// fill ask as market maker
console.log(BITCUSDOrderBook.getBookSnapShot());
BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1507.00", 10, "Trishna")
BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1508.00", 10, "XYZ")
BITCUSDOrderBook.placeOrder("SELL", "LIMIT", "1509.00", 10, "ABC")
console.log(BITCUSDOrderBook.getBookSnapShot());


// console.log(BITCUSDOrderBook.getBookSnapShot());
// BITCUSDOrderBook.placeOrder("BUY", "MARKET", "1500", 10, "trishna")
// console.log(BITCUSDOrderBook.getBookSnapShot());