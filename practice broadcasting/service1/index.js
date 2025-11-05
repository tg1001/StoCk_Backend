let {createClient}=require("redis");
let client =createClient();

async function notify() {
    await client.connect();
    await client.PUBLISH("notify_me", JSON.stringify({event_id:1,message:"iphone back in stock"}))
    await client.PUBLISH("update_me", JSON.stringify({event_id:1,message:"iphone KABOOM"}))
}
setTimeout(()=>{
    notify()
}, 2000)
// client.connect()
//.then(()=>console.log("redis SERVICE    1"))