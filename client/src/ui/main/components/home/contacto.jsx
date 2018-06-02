import React from 'react';
import { ValidationErrors, validationRegexs } from '../../../../lib/validations';
import { Form } from 'formsy-react-components';
import { Icon, Spin, notification, Button } from 'antd';
import Input from '../../../admin/components/common/formsyAntInput';
import axios from 'axios';
import { urls } from '../../../../lib/http';

class Contacto extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loading: false
    }
   this.onValidSubmit = this.onValidSubmit.bind(this);
   this.onSubmit = this.onSubmit.bind(this);
  }
  onSubmit(formData){
    return axios.post(urls.apiContactURL, { contact: formData})
      .then( res =>{
        const { message } = res.data;
        return Promise.resolve(message);
      }).catch( errors =>{
        return Promise.reject(errors);
      })
  }

  onValidSubmit(formData, resetFormFn, invalidateFormFne){
    console.log("submitted");
    this.setState({ loading: true});

    this.onSubmit(formData)
      .then( message  =>{
        notification.success({ message: message } );
      }).catch(errors =>{
        if(!errors)
          return; 
        let formErrors = {};

        Object.keys(errors).forEach(key => {
          formErrors[key] = errors[key].message
        });
        
        invalidateFormFn(formErrors);
      })
      .finally(()=>{
        this.setState({ loading: false });
      });
  }

  render(){
    return(
      <div className="contact" >
        <div className="contact-header all-width" >
          <h3>CONTACTO</h3>
          <div className="spacer spacer-black" ></div>
        </div>
        <div className="contact-text all-width">
          <i>
            Para más información acerca de nuestros servicios, mándanos un mensaje con tu datos.
            <br/>
            ¡Gracias por elegirnos!
           </i>
        </div>
        <div className="contact-form lg-50" >
        <Spin className="register-loading" spinning={this.state.loading}>
          <Form ref="form" noValidate validateOnSubmit={true} onValidSubmit={this.onValidSubmit} >
          <div className="lg-50-inline centered-md-50 centered-sm-80">
            <div className="">
              <Input
                label="Tu Nombre"
                name="name"
                value=""
                required
                validationErrors={ValidationErrors}
                validations={{matchRegexp: validationRegexs.name}}
                />
            </div>
            <div className="" >
              <Input
                label="Tu email"
                name="email"
                required
                validationErrors={ValidationErrors}
                validations="isEmail"
              />
            </div>
            <div className="" >
              <Input
                label="Tu Télefono"
                name="phone"
                value=""
                required
                validationErrors={ValidationErrors}
                validations="isNumeric"
              />
            </div>
            <div className="" >
              <Input
                label="Ciudad donde desea ser atendido*"
                name="city"
                value=""
                required
                validationErrors={ValidationErrors}
                validations={{matchRegexp: validationRegexs.name}}
              />
            </div>
          </div>
            <div className="lg-50 centered-md-50 col-right centered-sm-80">
              <div>
                <Input
                  label="Mensaje"
                  className="mensaje"
                  required
                  type="textarea"
                  value=""
                  name="message"
                  autosize={{minRows: 4,maxRows: 6}}
                  validationErrors={{minLength: "Minimo 5 caracteres", required: "Este campo es requerido"}}
                  validations="minLength:5"
                />
              </div>
              <div>
                <Button
                  formNoValidate={true}
                  className="submit-contacto-form"
                  htmlType="submit"
                >
                  Enviar
                </Button>
              </div>
            </div>
          </Form>
        </Spin>
        </div>
      </div>
    );
  }
}
export default Contacto;