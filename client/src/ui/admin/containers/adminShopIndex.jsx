import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Table from 'antd/lib/table';
import Button from 'antd/lib/button';
import Badge from 'antd/lib/badge';
import notification from 'antd/lib/notification';

import ImgCell from '../components/common/imgCell.jsx';
import SelectCell from '../components/adminShopIndex/selectCell';
import FilterCell from '../components/adminSlider/filterCell.jsx';
//actions
import { loadBanners,
         addBanner,
         deleteBannerImage,
         addBannerImage,
         patchBanner,
         deleteBanner } from '../../../actions/bannersActions';

import { searchProductGroupTags } from '../../../actions/adminProductGroupsActions';

class AdminShopIndex extends React.Component{
  constructor(props){
    super(props);

    this.state ={
      dataSource: [],
      options: [
        { value: 'primary',     disabled: false },
        { value: 'secondary',   disabled: false },
        { value: 'complement1', disabled: false },
        { value: 'complement2', disabled: false },
        { value: 'complement3', disabled: false },
        { value: 'complement4', disabled: false }
      ],
      loading: false
    }

    this.getImageCell = this.getImageCell.bind(this);
    this.getImageDimensionsByType = this.getImageDimensionsByType.bind(this);
    this.mapBannerTypesToOptions = this.mapBannerTypesToOptions.bind(this);
    this.onAddBanner = this.onAddBanner.bind(this);
    this.onTypeSubmit = this.onTypeSubmit.bind(this);
    this.getTypeCell = this.getTypeCell.bind(this);
    this.getAvailableOptions = this.getAvailableOptions.bind(this);

    this.columns = [
      { title: 'Etiqueta',
        dataIndex: 'tag',
        sorter: (a,b)=>{  a.tag.localeCompare(b.name) },
        render: (text,row) =>{ return this.getTypeCell(row)},
        width: '35%'
      },
      { title: 'Tipo',
        dataIndex: 'type',
        ///sorter: (a,b)=>{ a.type.localeCompare(b.link) },
        render: (text,row)=>{ return this.getSelectCell(row) },
        width: '35%'
      },
      { title: 'Imagen',
        dataIndex: 'image',
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
                <a onClick={() => this.props.deleteBanner(row.key)}>Borrar</a>
            </div>
          );
        },
        width: '10%'
      }
    ];
  }

  componentDidMount(){
    this.props.loadBanners();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.banners && nextProps.banners.length){
      let dataSource = nextProps.banners.map((banner)=>{
         return {
           key: banner._id,
           tag: banner.tag,
           type: banner.type,
           image: banner.image
         }
      });
      let options = this.mapBannerTypesToOptions(nextProps.banners);
      this.setState({dataSource, options });
   }else{
     this.setState({dataSource: []})
   }
  }

  getImageCell(row){
    const imageDimensios = this.getImageDimensionsByType(row.type);
    return (
      <ImgCell id={row.key} image={row.image} onAddImage={this.props.addBannerImage}
               onDeleteImage={this.props.deleteBannerImage} {...imageDimensios} />
    );
  }
  getSelectCell(row){
    return(
      <SelectCell onSubmit={this.onTypeSubmit} id={row.key} value={row.type} options={this.state.options} />
    );
  }

  getTypeCell(row){
    return(
        <FilterCell
          row={row}
          noResultsText={'Sin resultados'}
          placeholder={row.tag}
          search={this.props.searchProductGroupTags}
          lengthToSearch={3}
          updatingField={this.onSubmitTag.bind(this, row)}
          options={this.props.productGroupTags}
          propsToOptions={this.tagsToOptions.bind(this)}
        />
    );
  }

  onAddBanner(){
    this.setState({loading: true })
    let banner = { tag: 'default'};
    let opt = this.getAvailableOptions();
    if(opt)
      banner.type = opt.type;
    this.props.addBanner({
        banner
      }).finally(()=>{
        this.setState({ loading: false});
      })
  }

  getAvailableOptions(){
    return this.state.options.find( opt => opt.disabled == false );
  }

  onTypeSubmit(bannerID, value){
    const oldBanner = this.props.banners.find( banner => banner._id == bannerID);
    if(!oldBanner){
      notification.error({message: "Not found"});
    }else{
    const newBanner = value ? Object.assign({},oldBanner,{type: value}): { tag: oldBanner.tag };
    this.props.patchBanner(oldBanner, newBanner)
      .then()
      .catch( error => {
        notification.error({message: error.message});
      });
    }
  }

  onSubmitTag(row, changedField){
    const oldBanner = this.props.banners.find( banner => banner._id == row.key);
    if(!oldBanner){
      notification.error({message: "Not found"});
    }else{
    const newBanner = Object.assign({},oldBanner,{tag: changedField.value});
    this.props.patchBanner(oldBanner, newBanner)
      .then()
      .catch( error => {
        notification.error({message: error.message});
      });
    }
  }

  tagsToOptions(tags){
    return tags.map( tag =>{
      return {
        value: tag.tags,
        label: tag.tags
      }
    });
  }

  getImageDimensionsByType(type){
    switch(type){
      case 'primary':
        return { imageMinWidth: 800, imageMinHeight: 350, imageHeight: 9000, imageWidth: 9000, imageSize: 6000 }
      case 'secondary':
        return { imageMinWidth: 800, imageMinHeight: 200, imageHeight: 9000, imageWidth: 9000, imageSize: 6000 }
      // default types are complements types e.g 'complement1', 'complement2'
      default: 
        return { imageMinWidth: 100, imageMinHeight: 100, imageHeight: 9000, imageWidth: 9000, imageSize: 6000 }
    }
  }

  mapBannerTypesToOptions(banners){
    return this.state.options.map(opt => {
      if(banners.find(ban => ban.type === opt.value))
        return { value: opt.value, disabled: true }
      return { value: opt.value, disabled: false }
    });
  }

  render(){
    return(
      <div className="admin-shop-index">
        <Table
          loading={this.state.loading}
          columns={this.columns}
          dataSource={this.state.dataSource}
          title={()=>
            <div>
              <h2 style={{display: "inline"}}>Elementos Banner</h2>
                <div style={{display: "inline", float: "right"}}>
                   <Button type="default" 
                     className="add-btn"
                     onClick={this.onAddBanner} 
                   >
                   Agregar
                   </Button>
                </div>
             </div>
          }
        ></Table>
      </div>
    );

  }
}
const mapStateToProps = (state)=>{
  return {
    banners: state.banners,
    productGroupTags: state.productGroupTags
  }
};

const mapDispatchToProps = (dispatch)=>{
  return {
    loadBanners: ()=>{
      return dispatch(loadBanners());
    },
    deleteBannerImage: (bannerID)=>{
      return dispatch(deleteBannerImage(bannerID));
    },
    addBanner: (banner)=>{
      return dispatch(addBanner(banner));
    },
    addBannerImage: (bannerID, imageUpload)=>{
      return dispatch(addBannerImage(bannerID, imageUpload));
    },
    patchBanner: (oldBanner, newBanner)=>{
      return dispatch(patchBanner(oldBanner, newBanner)); 
    },
    searchProductGroupTags: (search)=>{
      return dispatch(searchProductGroupTags(search));
    },
    deleteBanner: (bannerID)=>{
      return dispatch(deleteBanner(bannerID));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminShopIndex);