/* eslint-disable react/prop-types */
import { useContext } from "react";
import Tag from "./tags.component";
import { EditorContext } from "../pages/editor.pages";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";

const PublishForm = () => {

    let { blog_id } = useParams();

    let characterLimit = 200;
    let tagLimit = 10;

    let { blog, blog: { title, des, tags, banner }, setEditorState, setBlog, setTextEditor } = useContext(EditorContext);
    let { userAuth: { access_token } } = useContext(UserContext);

    let navigate = useNavigate();

    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleBlogTitleChange = (e) => {
        setBlog({ ...blog, title: e.target.value })
    }

    const handleCharacterChange = (e) => {
        setBlog({ ...blog, des: e.target.value});
    }

    const handleKeyStrokes = (e) => {
        if(e.keyCode == 13) {
            e.preventDefault();
        }
    }

    const handleKeyDown = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188) { // press enter
            e.preventDefault();

            let tag = e.target.value;
            
            if(tags.length < tagLimit){
                if(!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...tags, tag] });
                }
            } else{
                toast.error(`Puedes añadir máximo ${tagLimit} Tags`);
            }

            e.target.value = "";
        }
    }

    const publishBlog = (e) => {

        if(e.target.className.includes("disable")){
            return;
        }

        if(!title.length){
            return toast.error("Escribe el título del blog antes de publicarlo");
        } else if(des.length > 200 || !des.length){
            return toast.error("Escribe una descripción explicando tu blog dentro de 200 cacteres para publicar")
        } else if(!tags.length){
            return toast.error("Introduce al menos 1 etiqueta para ayudarnos a clasificar tu blog")
        } else {

            let loadingToast = toast.loading("Publicando...");

            e.target.classList.add('disable');
            // submit the data to backend

            blog_id ? blog["id"] = blog_id : "";

            blog.draft = false;
            
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", blog, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(() => { 

                e.target.classList.remove('disable');

                toast.dismiss(loadingToast);
                toast.success("Publicado 👍");

                resetEditor();

                setTimeout(() => {
                    navigate(`/dashboard/blogs`);
                }, 500);
            })
            .catch(({ response }) => {
                e.target.classList.remove('disable');

                toast.dismiss(loadingToast);
                return toast.error(response.data.error);
            })
        }

    }

    const resetEditor = () => {
        setTextEditor({ isReady: false });
    }

    return(
        <AnimationWrapper>
            <section className="lg:fixed top-0 w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">

                <Toaster />

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]" 
                onClick={handleCloseEvent}
                ><i className="fi fi-br-cross"></i></button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-2">Vista previa</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner} />
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>
                    
                    <p className=" font-gelasio line-clamp-2 text-xl leading-7 mt-4">{ des }</p>
                </div>

                <div className="border-grey lg:border-l lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Título del Blog</p>
                    <input type="text" placeholder="Título del Blog" defaultValue={title.length ? title : ""} 
                    onChange={handleBlogTitleChange}  
                    className="input-box pl-4"/>

                    <p className="text-dark-grey mb-2 mt-9">Breve descripción sobre tu post</p>
                    <textarea maxLength={characterLimit} defaultValue={des} className='h-40 resize-none leading-7 input-box pl-4' 
                    onChange={handleCharacterChange}
                    id="shortDes" 
                    onKeyDown={handleKeyStrokes}
                    ></textarea>
                    <p className='mt-1 text-dark-grey text-sm text-right'>{characterLimit - des.length} caracteres restantes</p>

                    <p className="text-dark-grey mb-2 mt-9">Temas - ( Ayudan a buscar y clasificar tu post )</p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Temas" className="sticky input-box bg-white focus:bg-white top-0 left-0 pl-4 mb-3" 
                        onKeyDown={handleKeyDown}
                        />
                        {                        
                            tags.map((tag, i) => <Tag key={i} tag={tag} /> )
                        } 
                    </div>
                    <p className='mt-1 mb-4 text-dark-grey text-right'>{tagLimit - tags.length} Tags left</p>

                    <button className="btn-dark px-8" 
                    onClick={publishBlog}
                    >{ !blog_id ? "Publicar" : "Guardar Cambios" }</button>

                </div>

                </section>
        </AnimationWrapper>
    )
}

export default PublishForm;