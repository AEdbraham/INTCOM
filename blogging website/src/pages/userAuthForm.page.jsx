import InputBox from "../components/input.component";
import google from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import axios from "axios";
import { storeInSession } from "../common/session";
import { useContext } from "react";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import AnimationWrapper from "../common/page-animation";
import { useRef } from "react";

const UserAuthForm = ({ type }) => {

    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext);

    const userAuthThroughServer = (formData, serverRoute) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
            
            storeInSession("user", JSON.stringify(data));
            
            setUserAuth(data)

        })
        .catch(({ response }) => {
            console.log(response);
            toast.error(response.data.error);
        })

    }

    const handleSubmit = (e) => {
        
        e.preventDefault(); // stopping form from getting submit

        let serverRoute = type == 'sign_in' ? '/signin' : '/signup';
        
        // validations

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // email for password

        // form data
        let form = new FormData(formElement);
        let formData = {};

        for (let [key, value] of form.entries()) { 
            formData[key] = value
        }
        // console.log(formData, authForm.current);
        let { email, password, fullname } = formData;

        // form validation
        if(fullname){
            if (fullname.length < 3) {
                return toast.error('El nombre completo debe tener al menos 3 letras');
            }
        }

        if(!email.length) {
            return toast.error("Introduzca su correo electrónico")
        }

        if(!emailRegex.test(email)) {
            return toast.error("Correo no válido")
        }

        if(!passwordRegex.test(password)) {
            return toast.error("La contraseña debe tener entre 6 y 20 caracteres, al menos 1 numérico, 1 minúscula y 1 mayúscula")
        }
        

        // sending data to server

        userAuthThroughServer(formData, serverRoute);

    }

    const handleGoogleAuth = (e) => {
        e.preventDefault()

        authWithGoogle().then(user => {
            let serverRoute = '/google-auth';
        
            let formData = {
                accessToken: user.accessToken
            }
    
            userAuthThroughServer(formData, serverRoute);
        })
        .catch(err => {
            toast.error('problemas para iniciar sesión a través de google')
            return console.log('problemas para iniciar sesión a través de google =>', err)
        })
    }

    return (
        
        access_token ? 
        <Navigate to="/" />
        :
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster />
                <form className="w-[80%] max-w-[400px]" id="formElement">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                        {type == "sign_in" ? "Bienvenido de nuevo" : "Úente a nosotros hoy"}
                    </h1>

                    {
                        // condition to check for whether to create name field or not
                        type != "sign_in" ?
                            <InputBox
                                name="fullname"
                                type="text"
                                placeholder="Nombre Completo"
                                icon="fi fi-sr-user"
                            />
                        : ""
                    }

                    <InputBox
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon="fi fi-sr-envelope"
                    />

                    <InputBox
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        icon="fi fi-sr-key"
                    />

                    <button
                        className="btn-dark center mt-14"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        {type.replace("_", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2  my-10 opacity-10 uppercase text-black font-blod">
                        <hr className="w-1/2 border-black" />
                        <p>ó</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    <button
                        className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                        onClick={handleGoogleAuth}
                    >
                        <img src={google} className="w-5" />
                        Continúa con Google
                    </button>

                    {
                        // condition to check for whether to its a sign_in form or signup form
                        type == "sign_in" ? 
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            ¿No tienes una cuenta?
                            <Link
                                className="underline text-black text-xl ml-1"
                                to="/signup"
                            >
                                Úente a nosotros hoy
                            </Link>
                        </p> : 
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            ¿Ya eres miembro?
                            <Link
                                className="underline text-black text-xl ml-1"
                                to="/signin"
                            >
                                Inicia sesión aquí
                            </Link>
                        </p>
                        
                    }
                </form>
            </section>
        </AnimationWrapper>
        
    );
};

export default UserAuthForm;
