import mongoose  from "mongoose";

mongoose.set("strictQuery" , false);

const connectionToDb = async () =>{
    try{
        const connection  = await mongoose.connect("mongodb://127.0.0.1:27017/khareediyeJi");
        if(connection){
            console.log("Mongo db is successfully connected with" ,  connection.connection.host);
        }
    }catch(e){
        console.log("Found some error while connecting with databases");
    }
}

export default connectionToDb;