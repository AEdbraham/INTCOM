import { useContext, useEffect, useRef } from "react";
import { EditorContext } from "../pages/editor.pages";
import { Link, useParams, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.png"
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import { Toaster, toast } from "react-hot-toast";
import { uploadImage } from "../common/aws";
import defaultBanner from "../imgs/blog banner.png";
import axios from "axios";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";

const BlogEditor = () => {

    let { blog, blog: { title, des, banner, content, tags }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);

    let { userAuth: { access_token } } = useContext(UserContext);
    let { blog_id } = useParams();
    let blogBannerRef = useRef();

    let navigate = useNavigate();

    // let editorJS;

    useEffect(() => {
        setTextEditor(new EditorJS({
            holderId: "textEditor",
            tools: tools,
            data: Array.isArray(content) ? content[0] : content,
            placeholder: "¡Vamos a escribir una historia increíble!",
        }))
    }, [])

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];

        if (img) {
            let loadingToast = toast.loading("Cargando...");

            uploadImage(img).then((url) => {
                if (url) {
                    setBlog(latestBlogObj => ({ ...latestBlogObj, banner: url }))

                    toast.dismiss(loadingToast);
                    toast.success("Cargado 👍");

                    blogBannerRef.current.src = url;
                }
            }).catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err)
            })
        }
    };

    const handleTitleKeyStroke = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    };

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = null;
        input.style.height = input.scrollHeight + "px";

        setBlog({ ...blog, title: input.value })
    };

    const handlePublishEvent = (e) => {
        e.preventDefault();
        
       // if(!banner.length) {
       //     return toast.error("Upload a blog banner to publish it");
       // }
        if(!title.length){
            return toast.error("Escribe el título del blog para publicarlo");
        }

        if(textEditor.isReady){
            textEditor.save().then(data => {
                if(data.blocks.length){
                    setBlog({ ...blog, content: data });
                    setEditorState("publicar");
                } else{
                    return toast.error("Escribe algo en tu blog para publicarlo");
                }
            }).catch((error) => {
                console.log(error)
            });
        }
    };

    const handleSaveDraft = (e) => {
        e.preventDefault();
        
        if(!title.length){
            return toast.error("Debes proporcionar un título para guardar este borrador");
        }

        // saving draft

        let loadingToast = toast.loading("Publicando....");

        e.target.classList.add('disable');

        if(textEditor.isReady){
            textEditor.save().then(async data => {
                let content = data.blocks.length ? data : [];

                let blogObj = { title, des, banner, tags, content, draft: true }

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                .then(( ) => {
                    e.target.classList.remove('disable');

                    toast.dismiss(loadingToast);
                    toast.success("Borrador guardado 👍");
    
                    resetEditor();
    
                    setTimeout(() => {
                        navigate(`/dashboard/blogs?tab=draft`);
                    }, 500);
                })
                .catch(({ response }) => {
                    e.target.classList.remove('disable');
    
                    toast.dismiss(loadingToast);
                    return toast.error(response.data.error);
                })
            })
        }
    }

    const handleBannerImageError = (e) => {
        e.target.src = defaultBanner;
    }

    const resetEditor = () => {
        setTextEditor({ isReady: false });
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-20 h-20">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    { title.length ? title: "Nuevo Blog" }
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" 
                    onClick={handlePublishEvent}
                    >
                        Publicar
                    </button>

                    <button className="btn-light py-2"
                    onClick={handleSaveDraft}
                    >
                        Guardar Borrador
                    </button>
                        
                </div>
            </nav>

            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">

                        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
                            <label
                                htmlFor="uploadBanner"
                            >
                                <img
                                    // ref={blogBannerRef}
                                    // className="z-20"
                                    src={defaultBanner}
                                    // onError={handleBannerImageError}
                                />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    // onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                            placeholder="Título del blog"
                            defaultValue={title.length ? title : ""}
                            onKeyDown={handleTitleKeyStroke}
                            className="text-4xl font-medium placeholder:opacity-40 w-full h-20 outline-none resize-none mt-10 leading-tight"
                            onChange={handleTitleChange}
                        ></textarea>

                        <hr className="w-full opacity-10 my-5" />

                        <div id="textEditor" className="font-gelasio"></div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
}

export default BlogEditor;