import { Link } from "react-router-dom";
import pageNotFoundImage from "../imgs/404.png";
import fullLogo from "../imgs/full-logo.png";

const PageNotFound = () => {
    return (
        <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">

            <img src={pageNotFoundImage} className="select-none border-2 border-grey w-72 aspect-square object-cover rounded" />

            <h1 className="text-4xl font-gelasio leading-7">Página no encontrada</h1>
            <p className="text-dark-grey text-xl leading-7 -mt-8">La página que busca no existe. Vuelve a la página <Link to="/" className="text-black underline">Home page</Link></p>

            <div className="mt-auto">
                <img src={fullLogo} className="h-8 object-contain block mx-auto select-none" />
                <p className="mt-5 text-dark-grey">Lea cientas de historias de todos nuestros estudiantes</p>
            </div>

        </section>
    )
}

export default PageNotFound;