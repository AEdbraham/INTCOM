import InputBox from "../components/input.component";
import { useContext, useRef } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";

const ChangePassword = () => {

    let { userAuth: { access_token } } = useContext(UserContext);
    let changePasswordForm = useRef();

    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(changePasswordForm.current);
        let formData = {}

        for(let [key, value] of form.entries()){
            formData[key] = value
        }

        let { currentPassword, newPassword } = formData;

        if (!currentPassword.length || !newPassword.length) {
            return toast.error("Rellena todos los campos");
        }
        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error('La contraseña debe tener entre 6 y 20 caracteres con al menos 1 numérico, 1 minúscula y 1 mayúscula')
        }

        // sending password to server
        e.target.setAttribute("disabled", true);

        let loadingToast = toast.loading("Actualizando....");
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData,{ 
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            
            toast.dismiss(loadingToast);                
            e.target.removeAttribute("disabled");
            return toast.success("Contraseña actualizada")

        })
        .catch(({response}) => {
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(response.data.error);
        })

    }

    return (
        <AnimationWrapper>
            <Toaster/>
            <form ref={changePasswordForm}>
                <h1 className="max-md:hidden">Cambiar Contraseña</h1>

                <div className="py-10 w-full md:max-w-[400px]">
                    <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Contraseña actual" icon="fi-rr-unlock"/>
                    <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="Nueva contraseña" icon="fi-rr-unlock"/>

                    <button className="btn-dark px-10" type='submit' onClick={handleSubmit}>
                        Cambiar Contraseña
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    )

}

export default ChangePassword;