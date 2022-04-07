import {MiddlewareFn} from "type-graphql"
import {verify} from "jsonwebtoken"
import {Response,Request} from "express"


export interface IContext {
    req: Request,
    res: Response,
    payload: { userId: string }
};


export const isAuth:MiddlewareFn<IContext> = ({context},next)=>{

    try{

        const BearToken = context.req.headers["authorization"];

        if (!BearToken) {
            const error = new Error()
            error.message = "Sin autorizacion"
            throw error
        }

        const jwt = BearToken.split(" ")[1]
        const payload = verify(jwt,"SecretKey")
        context.payload = payload as any

        return next()
    }catch(error:any){

        throw new Error(error)
    }

}


