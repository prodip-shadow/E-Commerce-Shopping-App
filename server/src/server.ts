import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import connectDB from "./config/db.js";
import { clerkWebhook } from "./controllers/webhooks.controller.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductsRouter from "./routes/products.route.js";
import CartRouter from "./routes/cart.route.js";

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




await makeAdmin();

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});