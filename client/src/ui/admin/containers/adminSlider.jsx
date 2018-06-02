import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Badge, Button, notification } from 'antd';

import EditableCell from '../components/common/editableCell.jsx';
import InlineInput from '../components/common/inlineInput.jsx';
import FilterCell from '../components/adminSlider/filterCell.jsx';
import ImgCell from '../components/common/imgCell';

//actions
import { loadSliderItems,
         addSliderItem,
         addSliderItemImage,
         patchSliderItem,
         deleteSliderItemImage,
         deleteSliderItem } from '../../../actions/adminSliderItemsActions.js';
import { searchProductGroups } from '../../../actions/adminProductGroupsActions';



class AdminSlider extends React.Component {
  constructor(props){
    super(props);
    
    this.state ={
      showImageModal: false,
      loading: false,
      dataSource: []
    }

    this.getImageCell = this.getImageCell.bind(this);
    this.onAddSliderItem = this.onAddSliderItem.bind(this);
    this.onDeleteSliderItem = this.onDeleteSliderItem.bind(this);
    this.getEditNameCell = this.getEditNameCell.bind(this);
    this.getProductGroupsCell = this.getProductGroupsCell.bind(this);
    //this.onSubmitProductGroup = this.onSubmitProductGroup.bind(this);

    this.columns = [
      { title: 'Nombre',
        dataIndex: 'name',
        sorter: (a,b)=>{  a.name.localeCompare(b.name) },
        render: (text,row) =>{ return this.getEditNameCell(row)},
        width: '35%'
      },
      { title: 'Producto/Grupo',
        dataIndex: 'link',
        sorter: (a,b)=>{ a.link.localeCompare(b.link) },
        render: (text,row)=>{ return this.getProductGroupsCell(row) },
        width: '35%'
      },
      { title: 'Imagen',
        dataIndex: 'imgSrc',
        render:(text,row) =>{ return this.getImageCell(row) },
        width: '20%'
      },
      {
        title: 'Opciones',
        dataIndex: 'options',
        render: (text,row) => {
          return(
            <div>
                <Badge status="error" />
                <a onClick={() => this.onDeleteSliderItem(row.key)}>Borrar</a>
            </div>
          );
        },
        width: '10%'
      }
    ];
  }

  onValidNameSubmit(row, changedField, resetFn, updateInputsWithErrorFn, closeInputFn){
   closeInputFn && closeInputFn();
    this.setState({loading: true});
    const oldItem = this.props.sliderItems.find(item => item._id == row.key);
    if(!oldItem){
      notification.error({message:"Not Found"});
      this.setState({loading: false})
    }else{
    const newItem = Object.assign({}, oldItem, changedField);
    this.props.patchSliderItem(oldItem,newItem)
      .then(()=>{})
      .catch(error => notification.error({message: error}))
      .finally(()=>{
      this.setState({loading: false});
    });}
  }

  onSubmitProductGroup(row, changedField){
    this.setState({ loading: true});
    const oldItem = this.props.sliderItems.find( item => item._id == row.key);
    if(!oldItem){
      notification.error({message: "Not found"});
      this.setState({ loading: false});
    }else{
    const newItem = Object.assign({},oldItem,{ productGroup: { name: changedField.label, link: changedField.value }});
    this.props.patchSliderItem(oldItem, newItem)
    .catch(error => {notification.error({message: error.message})})
    .finally(()=> {this.setState({ loading: false})})
    }
  }

  onInvalidNameSumbit(row, changedField, resetFn, updateInputsWithErrorFn, errorArr){
    notification.error({ message: errorArr[0] || 'Invalid input' });
  }

  onAddSliderItem(){
    this.setState({loading: true});

    this.props.addSliderItem(
      { 
        sliderItem: {
          name: "nuevo elemento",
          link: "producto/xxx",
          productGroup:{
            name: "nuevo",
            link: "products/xxxxx"
          }
        } 
      }
    )
    .then(()=>{})
    .finally(()=>{
      this.setState({loading: false});
    });
  }

  onDeleteSliderItem(sliderItemID){
    this.setState({ loading: true });
    
    this.props.deleteSliderItem(sliderItemID)
      .then(()=>{})
      .finally(()=>{
        this.setState({loading: false});
      });
  }

  propsToOptionsProductGroups(props){
    return props.map( op =>{
      return {
        value: 'products/'+ op.sku ,
        label: op.name
      }
    });
  }

  getEditNameCell(row){
    return(
      <EditableCell
        displayComponent={<a>{row.name}</a>}
        editComponent={InlineInput}
        editComponentProps={{
          onValidSubmit: this.onValidNameSubmit.bind(this,row), 
          onInvalidSubmit: this.onInvalidNameSumbit.bind(this,row),
          inputType: "text",
          name: "name", 
          value: row.name, 
          required: true
        }}
      />
    );
  }

  getProductGroupsCell(row){
    return(
      <FilterCell
        row={row}
        noResultsText={'Sin resultados'}
        placeholder={row.productGroup.name}
        search={this.props.searchProductGroups}
        lengthToSearch={3}
        updatingField={this.onSubmitProductGroup.bind(this, row)}
        options={this.props.adminProductGroups}
        propsToOptions={this.propsToOptionsProductGroups.bind(this)}
      />
    );
  }

  getImageCell(row){
    return (
      <ImgCell id={row.key} image={row.image} onAddImage={this.props.addSliderItemImage}
               onDeleteImage={this.props.deleteSliderItemImage} imageWidth={4000} 
               imageHeight={3000} imageSize={1000}/>
    );
  }

  componentDidMount(){
    this.props.loadSliderItems();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.sliderItems && nextProps.sliderItems.length){
       let dataSource = nextProps.sliderItems.map((item)=>{
          return {
            key: item._id,
            name: item.name,
            productGroup: item.productGroup,
            link: item.link,
            image: item.image
          }
       });
       this.setState({dataSource});
    }else{
      this.setState({dataSource: []})
    }
  }
  
  render(){
    return(
      <div id="admin-slider" className="container-fluid">
        <Table loading={this.state.loading}
          columns={this.columns}
          dataSource={this.state.dataSource}
          title={ ()=> 
                      <div>
                        <h2 style={{display: "inline"}}>Elementos del carrusel</h2>
                        <div style={{display: "inline", float: "right"}}>
                            <Button type="default" 
                              className="add-btn" 
                              onClick={this.onAddSliderItem} 
                            >
                            Agregar
                            </Button>
                        </div>
                      </div>
          }
        >
        </Table>
      </div>
    )
  };
};

const mapStateToProps = (state)=>{
  return {
    sliderItems: state.sliderItems,
    adminProductGroups: state.adminProductGroups
  }
};

const mapDispatchToProps = (dispatch)=>{
  return {
    loadSliderItems: ()=>{
      return dispatch(loadSliderItems());
    },
    addSliderItem: (sliderItem)=>{
      return dispatch(addSliderItem(sliderItem));
    },
    addSliderItemImage: (sliderItemID, imageUpload)=>{
      return dispatch(addSliderItemImage(sliderItemID, imageUpload));
    },
    patchSliderItem: (oldItem,newItem) =>{
      return dispatch(patchSliderItem(oldItem,newItem));
    },
    deleteSliderItem: sliderItemID => {
      return dispatch(deleteSliderItem(sliderItemID));
    },
    deleteSliderItemImage: (sliderItemID) =>{
      return dispatch(deleteSliderItemImage(sliderItemID));
    },
    searchProductGroups: (search)=>{
      return dispatch(searchProductGroups(search));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminSlider);