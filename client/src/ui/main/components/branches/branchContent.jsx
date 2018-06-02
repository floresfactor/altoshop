import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

import Iframe from '../common/iframe';
import resources from '../../../../lib/constants/resources';

class BranchContent extends React.Component {
  constructor(props){
    super(props);
    this.state ={
    }
  }

  componentWillMount(){
    const { suscursal } = this.props.match && this.props.match.params;
    this.props.getBranch(suscursal);
  }
  componentWillReceiveProps(nextProps){
      if(nextProps.location !== this.props.location){
        const { suscursal } =  nextProps.match && nextProps.match.params;
        this.props.getBranch(suscursal);
      }
  }
  render(){
    const { branch } = this.props;
    return(
      <div className='branch-grid branch-grid-lg branch-grid-md grid-branch-sm'>
        <div className='branch-image'>
          <div className="branch-image-inside">
            <img className={branch.imgSrc == '/img/culiacan.jpg' ?  'logo' : ''} src={branch.imgSrc ? branch.imgSrc : resources.IMG_NO_IMG_URL} alt="kopay suscursales"/>
          </div>
        </div> 
        <div className='branch-data'>
          <div className="branch-date-inside" >
            <h2> {`${branch.city}, ${branch.state}`} </h2>
            <div className='spacer spacer-black'/>
            <p>{branch.address}</p>
            <br/>
            <p>Teléfono: {branch.phone || 'Próximamente'}</p>
          </div>
        </div>
        <div className="branch-hours">
          <div className="branch-hours-inside" >
            <h3> Horarios </h3>
            <p>{branch.serviceHours || 'Próximamente'}</p>
          </div>
        </div>
        <div className="branch-treatments">
          <div className="branch-treatments-inside" >
            <h3>Tratamientos disponibles:</h3>
              {branch.treatments ? branch.treatments.map( treat =>{
                return (
                  <Link key={treat.link} to={treat.link}>{treat.treatment} |</Link>
                );
              }) : 'Próximamente'}
          </div>
        </div>
        <div className="branch-maps">
          {branch.googleMapsSrc ? 
            <iframe src={branch.googleMapsSrc} width="100%" height="100%"></iframe> : <h3>Próximamente</h3> }
        </div>
      </div>
    );
  }
}
BranchContent.propTypes ={
  branch: PropTypes.object,
  getBranch: PropTypes.func
}
export default withRouter(BranchContent);