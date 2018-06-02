import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadBlogPosts } from '../../../actions/blogPostsActions';
import { urls } from '../../../lib/http';
import resources  from '../../../lib/constants/resources';

class BlogPosts extends React.Component {
  constructor(props){
    super(props);

  }
  componentDidMount(){
    this.props.loadPosts();
  }
  render(){
    return(
      <div className="blog-posts" > 
        <ul>
          {this.props.posts.map(post=>{
            return(
              <li key={post.id}>
                <div className="blog-content">
                  <div className="blog-image" >
                    <img src={post.feature_image ? `${urls.kopayURL}${post.feature_image}` : `${resources.IMG_NO_IMG_URL}`} alt="feature-image" className="img-responsive" />
                  </div>
                  <div className="blog-text" >
                    <a href={`${urls.blogURL}${post.url}`} >
                      <h5>{post.title}</h5>
                      <p className="block-with-text" >{post.custom_excerpt}</p>
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

BlogPosts.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    custom_excerpt: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    feature_image: PropTypes.string
  })).isRequired,
  loadPosts: PropTypes.func.isRequired 
}

const mapStateToProps = (state) =>{
  return {
    posts: state.blogPosts
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadPosts: (posts)=>{
      dispatch(loadBlogPosts(posts))
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(BlogPosts);
