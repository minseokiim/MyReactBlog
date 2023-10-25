import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import Card from "../components/Card";
import { useHistory, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "./Pagination";
import propTypes from "prop-types";
import useToast from "../hooks/toast";
//import { useSelector } from 'react-redux';

const BlogList = ({ isAdmin }) => {
  const { addToast } = useToast();

  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pageParam = params.get("page");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [numberOfPosts, setNumberOfPosts] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [searchText, setSearchText] = useState("");

  const limit = 5;

  // const toasts1 = useSelector((state) => {
  //   return state.toast.toasts;
  // });

  useEffect(() => {
    setNumberOfPages(Math.ceil(numberOfPosts / limit));
  }, [numberOfPosts]);

  const onClickPageButton = (page) => {
    history.push(`${location.pathname}?page=${page}`);
    setCurrentPage(page);
    getPosts(page);
  };

  const getPosts = useCallback(
    (page = 1) => {
      let params = {
        _page: page,
        _limit: limit,
        _sort: "id",
        _order: "desc",
        title_like: searchText,
      };

      if (!isAdmin) {
        params = { ...params, publish: true };
      }

      axios
        .get(`http://localhost:3001/posts`, {
          params,
        })
        .then((res) => {
          setNumberOfPosts(res.headers["x-total-count"]);
          setPosts(res.data);
          setLoading(false);
        });
    },
    [isAdmin, searchText]
  );

  useEffect(() => {
    setCurrentPage(parseInt(pageParam) || 1);
    getPosts(parseInt(pageParam) || 1);
  }, []);

  // const deleteToast = (id) => {
  //   const filteredToasts = toasts.current.filter((toast) => {
  //     return toast.id != id;
  //   });

  //   toasts.current = filteredToasts;
  //   setToastRerender((prev) => !prev);
  // };

  // const addToast = (toast) => {
  //   const id = uuidv4();
  //   const toastWithId = {
  //     ...toast,
  //     id,
  //   };
  //   toasts.current = [...toasts.current, toastWithId];
  //   setToastRerender((prev) => !prev);
  //   setTimeout(() => {
  //     deleteToast(id);
  //   }, 5000);
  // };

  const deleteBlog = (e, id) => {
    e.stopPropagation();
    axios.delete(`http://localhost:3001/posts/${id}`).then(() => {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      addToast({
        text: "Successfully deleted",
        type: "success",
      });
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderBlogList = () => {
    return posts.map((post) => {
      return (
        <Card
          key={post.id}
          title={post.title}
          onClick={() => history.push(`/blogs/${post.id}`)}
        >
          {isAdmin ? (
            <div>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => deleteBlog(e, post.id)}
              >
                Delete
              </button>
            </div>
          ) : null}
        </Card>
      );
    });
  };

  const onSearch = (e) => {
    if (e.key === "Enter") {
      history.push(`${location.pathname}?page=1`);
      setCurrentPage(1);
      getPosts(1);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="search..."
        className="form-control"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        onKeyUp={onSearch}
      />
      <hr />
      {posts.length === 0 ? (
        <div>No Blog posts found</div>
      ) : (
        <>
          {renderBlogList()}
          {numberOfPages > 1 && (
            <Pagination
              currentPage={currentPage}
              numberOfPages={numberOfPages}
              onClick={onClickPageButton}
            />
          )}
        </>
      )}
    </div>
  );
};

BlogList.propType = {
  isAdmin: propTypes.bool,
};

BlogList.defaultType = {
  isAdmin: false,
};

export default BlogList;
