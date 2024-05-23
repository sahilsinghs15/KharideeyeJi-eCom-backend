import mongoose , {Schema  ,Model , Document , model} from "mongoose";

export interface OrderDocument extends Document{
    orderId : number,
    orderName : string,
    userId : Schema.Types.ObjectId,
    orderPrice : number,
    orderAddress : string,
    orderStatus? : string,
    orderDate : Date,
    userName : string,
    userContact : string,
    orderImage : string
}

interface OrderModel extends Model<OrderDocument> {};

const orderSchema  = new Schema<OrderDocument , OrderModel>({
    orderId : {
        type : Number,
        required : [true, " Order id is required ... " ],
        trim : true,
        unique : true
    },

    orderName : {
        type : String , 
        required : [true , "Order Name is Required ..."],
        minlength : [10 , "Order Name should be atleast 10 character long..."],
        maxlength : [50 , "Order Name should not be greater than 50 characters"]
    },

    userId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        
    },

    orderPrice : {
        type : Number , 
        required : true,
        trim : true
    },

    orderAddress : {
        type : String , 
        minlength : [20 , 'Address Should be not less than 20 character'],
        maxlength : [60 , 'Address Should not be greater than 60 character '],
    },

    orderStatus : {
        type : String,
        default: 'Processing'
    },

    orderDate : {
        type : Date,
        default : Date.now()
    },

    userName : {
        type : String,
        required : [true, "User Name is required.."],
        minlength : [10 , "Username should be not less than 10 characters"],
        maxlength : [30 , "Username should not be greater than 30 characters"],
    },

    userContact : {
        type : String,
        required : [true , "User contact is required.."],
        match : [/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, 'Please enter a valid contact number']
    },

    orderImage : {
        type : String
    }

});

const Order = model<OrderDocument>('Order' , orderSchema);

export default Order;