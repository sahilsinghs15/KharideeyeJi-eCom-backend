var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const connectionToDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield mongoose.connect("mongodb://127.0.0.1:27017/khareediyeJi");
        if (connection) {
            console.log("Mongo db is successfully connected with", connection.connection.host);
        }
    }
    catch (e) {
        console.log("Found some error while connecting with databases");
    }
});
export default connectionToDb;
