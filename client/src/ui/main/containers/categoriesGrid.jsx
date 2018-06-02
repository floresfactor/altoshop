import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import dropRightWhile from 'lodash/dropRightWhile';

import ProdCard from './common/prodCard';

import { loadRecursiveCategories,
         filterRecursiveCategories } from '../../../actions/recursiveCategoriesActions';
import { loadCategoryDisplayItemsCategory, 
         removeCategoryDisplayItemsCategory } from '../../../actions/displayItemsActions';

import Card from 'antd/lib/card';
const CategoryCard = ({cat, onClickCategory })=>{
  return(
    <div className="category-card" onClick={onClickCategory.bind(this,cat)}>
      <Card>
        {
          cat.name.split(' ').map((word,index)=>{
            return(
              <h4 key={index}>{word}</h4>
            )
          })
        }
      </Card>
    </div>
  );
}

import Breadcrumb from 'antd/lib/breadcrumb';
const CategoryBreadcrumb = ({categories, onClickBreadCrumb})=>{
  return (
    <Breadcrumb>
      <Breadcrumb.Item onClick={onClickBreadCrumb.bind(this,null)}>Categorías</Breadcrumb.Item>
      {categories.map(cat =>{
        return(
          <Breadcrumb.Item key={cat._id} onClick={onClickBreadCrumb.bind(this,cat)}>{cat.name}</Breadcrumb.Item>
        )
      })}
    </Breadcrumb>
  );
};

class CategoriesGrid extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      categories : [],
      catBreadCrumb: []
    }

    this.renderCategoriesCards = this.renderCategoriesCards.bind(this);
    this.renderProdCards = this.renderProdCards.bind(this);
    this.onClickCategory = this.onClickCategory.bind(this);
    this.onClickBreadCrumb = this.onClickBreadCrumb.bind(this);
  }

  componentDidMount(){
    this.props.loadCategories();
    /*  .then(()=>{
    const categories = this.props.categories ? this.props.categories.map(cat=>{
        return Object.assign({},cat);
      }): [] ;
      this.setState({categories});
    });*/
  }

  componentWillUnmount(){
    this.props.removeDisplayItems();
  }

  onClickCategory(cat){
   /* const categories = cat.subCategories ? cat.subCategories.map(cat=>{
      return Object.assign({},cat);
    }): [] ;*/
    //const { catBreadCrumb } = this.state;
    if(cat){
      this.props.filterCategories(cat);
      this.props.loadDisplayItems(cat._id);
      this.setState((prevState)=>{
      return {
          //categories: categories,
          catBreadCrumb: [ ...prevState.catBreadCrumb, cat] 
        }
      });
    }
  }

  onClickBreadCrumb(catBread){
    if(catBread){
      /*const categories = catBread.subCategories ? catBread.subCategories.map(cat=>{
        return Object.assign({},cat);
      }): [] ;*/
      this.props.filterCategories(catBread);
      this.setState((prevState)=>{
        return {
          catBreadCrumb: dropRightWhile(prevState.catBreadCrumb, c => c._id != catBread._id) //,
          //categories: categories
        }
      });
      this.props.loadDisplayItems(catBread._id);
    }else{
      this.setState({catBreadCrumb:[]});
      this.props.loadCategories();
      this.props.removeDisplayItems();
    }
  }

  renderCategoriesCards(){
    return this.props.categories.map(cat =>{
      return(
        <CategoryCard key={cat._id} cat={cat} onClickCategory={this.onClickCategory}/>
      );
    });
  }
  renderProdCards(){
      return this.props.displayItems && this.props.displayItems.length > 0 ? this.props.displayItems.map(di =>{
        return(<ProdCard key={di._id} prod={di}></ProdCard>);
      }): null;
  }
  render(){
    const { categories } = this.props;
    return(
      <div className="categories-grid-container">
        <CategoryBreadcrumb categories={this.state.catBreadCrumb} onClickBreadCrumb={this.onClickBreadCrumb}/>
        <div className="categories-grid">
          { categories  ? this.renderCategoriesCards() : null }
          { this.renderProdCards() }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state)=>{
  return {
    categories: state.recursiveCategories,
    displayItems: state.displayItemsCategory
  }
}

const mapDispatchToProps = (dispatch)=>{
  return {
    loadCategories: ()=>{
      return dispatch(loadRecursiveCategories());
    },
    filterCategories: (category) =>{
      return dispatch(filterRecursiveCategories(category));
    },
    loadDisplayItems: (categoryID, options)=>{
      return dispatch(loadCategoryDisplayItemsCategory(categoryID, options));
    },
    removeDisplayItems: ()=>{
      return dispatch(removeCategoryDisplayItemsCategory());
    }
  }
}

CategoriesGrid.propTypes = {
  categories: PropTypes.array,
  displayItems: PropTypes.array
}

export default connect(mapStateToProps ,mapDispatchToProps)(CategoriesGrid);