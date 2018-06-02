import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Tree from 'antd/lib/tree';
const TreeNode = Tree.TreeNode;
import { loadRecursiveCategories } from '../../../actions/recursiveCategoriesActions';
import { loadCategoryDisplayItemsCategory } from '../../../actions/displayItemsActions';
import { currencyFormat } from '../../../lib/util/formatUtils';

class ProductAreas extends React.Component {
  constructor(props){
    super(props);
    this.mappingTree = this.mappingTree.bind(this);
    this.getTitle = this.getTitle.bind(this);
  }
  componentDidMount(){
    this.props.loadCategoryDisplayItemsCategory({pageSize: 99});
  }
  getTitle(displayItem){
    const productPrices = displayItem.itemType == 'productGroup' ? displayItem.item.products.map(p => p.price) : null;
    return(
      <Link to={`/products/${displayItem.itemSku}`}>
          <h4>{displayItem.name}</h4>
          <p>{`${currencyFormat(Math.min.apply(null, productPrices))}-${currencyFormat(Math.max.apply(null, productPrices))}
               ${displayItem.item.products[0].name}`}
          </p>
      </Link>
    )
  }
  mappingTree(categories){
     return categories.map(category =>{
        if(category.subCategories.length > 0){
          return(
            <TreeNode key={category._id} title={category.name}>
              {this.mappingTree(category.subCategories)}
              {this.props.displayItems.length > 0 ? this.props.displayItems.filter(di =>{
                return di.category === category._id
              }).map(di =>{
                  return <TreeNode key={di._id} title={this.getTitle(di)}/>
              }): <TreeNode/>}
            </TreeNode>
          );
        }else{
          return (
            <TreeNode key={category._id} title={category.name}>
              {this.props.displayItems.length > 0 ? this.props.displayItems.filter(di =>{
                return di.category === category._id
              }).map(di =>{
                  return <TreeNode key={di._id} title={this.getTitle(di)}/>
              }) : <TreeNode/>}
            </TreeNode>
          )
        }
     })
  }
  render(){
    return(
      <div className="product-areas">
        <Tree
        treeIcon={false}
        defaultExpandedKeys={['categorias']}
        >
          <TreeNode key="categorias" title="Areas">
            {this.props.recursiveCategories.length ? 
              this.mappingTree(this.props.recursiveCategories) : <TreeNode title="No categories" isLeaf/>}
          </TreeNode>
        </Tree>
      </div>
    );
  }
}

ProductAreas.propTypes ={
  recursiveCategories: PropTypes.array.isRequired,
  displayItems: PropTypes.array.isRequired
}

const mapStateToProps = (state)=>{
  return {
    recursiveCategories: state.recursiveCategories,
    displayItems: state.displayItemsCategory
  }
}
const mapDispatchToProps = (dispatch)=>{
  return {
    loadRecursiveCategories: ()=>{
      return dispatch(loadRecursiveCategories());
    },
    loadCategoryDisplayItemsCategory: (options)=>{
      return dispatch(loadCategoryDisplayItemsCategory(options));
    }
  }
}

export default connect(mapStateToProps ,mapDispatchToProps)(ProductAreas);