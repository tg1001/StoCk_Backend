//susb to two diff channel and then send data by publisher

    let {createClient}=require("redis");
    let client =createClient();

    async function notify_me2(){
    await client.SUBSCRIBE("notify_me", (message)=>{
        console.log(message)
    })
     await client.SUBSCRIBE("update_me", (message)=>{
        console.log(message)
    })
    }


    // async function notify_me2(){
    // await client.SUBSCRIBE("notify_me", (message)=>{
    //     console.log(message)
    // })
    // }
    setTimeout(()=>{
        notify_me2()
    }, 2000)
    
    client.connect()
    .then(()=>console.log("redis SERVICE 3"))