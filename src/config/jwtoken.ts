import{verify,sign} from "jsonwebtoken"

export const getToken = (payload:any) =>{
    
    return sign({payload},"secret key")

}

export const getTokenData = (token:any) =>{
    let data = null;
    verify(token,"secret key",(err:any,decoded:any)=>{
        if(err){
            console.log("error el decodificar")
        }else{
            data=decoded
        }
    })

    return data
}