/* eslint-disable no-undef */
import AnimationWrapper from "../common/page-animation";
import InPageNavigation, { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/loader.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {

    const [ blogs, setBlogs ] = useState(null);
    const [ trendingBlogs, setTrendingBlogs ] = useState(null);
    const [ pageState, setPageState ] = useState("home");

    let categories = ["programación", "internships", "materias", "recomendaciones", "recursos", "tecnología", "eventos", "lenguajes"];

    const fetchLatestBlogs = ({ page = 1 }) => {
        // latest blogs
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/latest-blogs', { page })
        .then(async ({ data }) => {

            let formatedData = await filterPaginationData({
                arr: blogs, 
                data: data.blogs,
                page,
                countRoute: "/all-latest-blogs-count"
            })

            setBlogs(formatedData)

        })
        .catch(err => {
            console.log(err)
        })

    }

    const fetchBlogsByCategory = ({ page = 1 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
        .then(async ({ data }) => {

            let formatedData = await filterPaginationData({
                arr: blogs, 
                data: data.blogs, 
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { tag: pageState }
            })

            setBlogs(formatedData)

        })
        .catch(err => {
            console.log(err);
        })
    }

    const fetchTrendingBlogs = () => {
        //trending blogs
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
        .then(({ data }) => {
            setTrendingBlogs(data.blogs);
        })
        .catch(err => {
            console.log(err)
        })
    }

    useEffect(() => {

        activeTabRef.current.click();

        if(pageState != 'home'){
            fetchBlogsByCategory(pageState);
            return;
        } 
            
        fetchLatestBlogs({ page: 1 });

        if(!trendingBlogs){
            fetchTrendingBlogs();
        }

    }, [pageState])

    const TrendingBlogsWrapper = () => {
        return (
            trendingBlogs == null ? <Loader /> :
                trendingBlogs.length ? 
                    trendingBlogs.map((blog, i) => {
                        return <AnimationWrapper key={i}><MinimalBlogPost blog={blog} index={i} /></AnimationWrapper>
                    })
                : <NoDataMessage message="No se han encontrado blogs en trend para ti" />
        )
    }

    const loadBlogbyCategory = (e) => {

        let category = e.target.innerText.toLowerCase();

        setBlogs(null);

        if(pageState == category){
            setPageState('home');
            return;
        }

        setPageState(category)
    }
 
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">

                <div className="w-full">
                    <InPageNavigation routes={ [pageState, "Tendencias para ti"] } defaultHidden={["Tendencias para ti"]}>
                        
                        <>
                            {   
                                blogs == null ? <Loader /> : 
                                    blogs.results.length ?    
                                        blogs.results.map((blog, i) => {
                                            return <AnimationWrapper key={i} transition={{ delay: i * 0.08 }} ><BlogPostCard content={blog} author={blog.author.personal_info} /></AnimationWrapper>
                                        })    
                                    :  <NoDataMessage message="No hay blogs publicados" />
                            } 
                            <LoadMoreDataBtn dataArr={blogs} fetchDataFunc={pageState == 'home' ? fetchLatestBlogs : fetchBlogsByCategory} />

                        </>

                        <TrendingBlogsWrapper />
                    
                    </InPageNavigation>
                </div>

                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">Historias para todos los intereses</h1>

                            <div className="flex gap-3 flex-wrap">
                                {
                                    categories.map((category, i) => {
                                        return <button key={i} onClick={loadBlogbyCategory} className={"tag " + (pageState == category ? "bg-black text-white" : "")} >{category}</button>
                                    })
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">Tendencias para ti <i className="fi fi-rr-arrow-trend-up"></i></h1>
                            {
                                trendingBlogs == null ? <Loader /> :
                                    trendingBlogs.length ? 
                                        trendingBlogs.map((blog, i) => {
                                            return <AnimationWrapper key={i}><MinimalBlogPost blog={blog} index={i} /></AnimationWrapper>
                                        })
                                    : <NoDataMessage message="No se encontraron tendencias para ti" />
                            }
                        </div>

                    </div>
                    
                </div>
            </section>
        </AnimationWrapper> 
    )
}

export default HomePage;