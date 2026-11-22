import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import connectDB from "./config/db.js";
import { clerkWebhook } from "./controllers/webhooks.controller.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductsRouter from "./routes/products.route.js";
import CartRouter from "./routes/cart.route.js";
import OrderRouter from "./routes/order.route.js";
import AddressRouter from "./routes/address.route.js";
import AdminRouter from "./routes/admin.route.js";
import { seedProducts } from "./scripts/seedProducts.js";

const app = express();

await connectDB();


app.post('/api/clerk',express.raw({type:'application/json'}),clerkWebhook)

// Middleware
app.use(cors())
app.use(express.json());
app.use(clerkMiddleware())


const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});



app.use('/api/products', ProductsRouter);
app.use('/api/cart', CartRouter);
app.use('/api/orders', OrderRouter);
app.use('/api/addresses', AddressRouter);
app.use('/api/admin', AdminRouter);



/*-------------------------------------------------------------------------------Make Admin-----------------------------------------------------------------------------------*/
await makeAdmin();

/*-------------------------------------------------Seed Dummy Products if no products exist-----------------------------------------------------------------------------------*/
// await seedProducts(process.env.MONGODB_URI as string);

if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

export default app;