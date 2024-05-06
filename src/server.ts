import app from "../src/app"
import connectionToDb from "../src/config/dbConfig";

const PORT = process.env.PORT || 5500;

app.listen(PORT , async ()=>{
    await connectionToDb();
    console.log(`App is running on PORT ${PORT}`);
})