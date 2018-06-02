import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Select } from 'antd';
import { DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import tZ from 'moment-timezone';
import _ from 'underscore';

const Shipment = ({ branches, onBranchSelect, selectedBranch, showShipmentBranchError, onChangeDatePicker,
                    showShipmentDateTimeError, showDatePicker, datePickerValue, timePickerValue, onChangeTimePicker, 
                    onOpenChangeDatePicker, showTimePicker }) => {
    branches = branches || [];
    const states = [];
    branches.forEach(b => {
        if (!~states.indexOf(b.address.state))
            states.push(b.address.state);
    });

    const branchesByState = states.map(state => {
        return branches.filter(b => b.address.state == state);
    });

    let getHours = (from, to)=>{
        let hours = [];
        let midhours = [];
        let start =  moment(from).clone();
        const end = moment(to).clone();
        do{
            hours.push(start.hour());
        }while(start.add(1,'hour').diff(end,'hours') < 0)
        if(end.minutes() > 0 ){
            midhours.push(end.hour());
            hours.push(end.hour());
        }
        return { hours: hours, midhours: midhours };
    }

    const getHoursService = (serviceTime) =>{
        let midhourss = []
        let hours = serviceTime.reduce((prev,current) =>{
            let { hours, midhours } = getHours(current.from, current.to);
            midhourss.push(...midhours);
            return [...prev,...hours]
        },[]);
        return { hours: hours, midhours: midhourss };
    }

    const getTimeWithTimeZone = () => {
        return tZ.tz(selectedBranch.timeZone);
    }

    const disabledHours = () => {
        let { hours } = getHoursService(selectedBranch.serviceTime)
        return _.without(_.range(24), ...hours);
    }

    const disabledMinutes = (h)=> {
        if(_.include(getHoursService(selectedBranch.serviceTime).midhours,h) )
            return _.range(1,60)
        return [..._.range(1,30),..._.range(31,60)]
    }

    const disabledDate = (current) => {
        let now = getTimeWithTimeZone();
        //console.log('witht time zone',getTimeWithTimeZone());
       // console.log('now', now);
        // Can not select days before today and today
        return current && current.valueOf() < now ;
    }
    
    if(timePickerValue && moment.isMoment(timePickerValue)){
        if( _.include(disabledHours(selectedBranch.serviceTime),timePickerValue.hours()) ){
            const { hours } = getHoursService(selectedBranch.serviceTime);
            timePickerValue.hour( hours[0]  );
        }
        if(_.contains(_.range(1,29),timePickerValue.minutes()) || _.contains(_.range(31,59), timePickerValue.minutes()) )
            timePickerValue.minute(0);
    }

    return (
        <div className="shipment-block">
            <Tabs defaultActiveKey={'1'} size="small">
                <Tabs.TabPane tab={<span><i className="fa fa-fw fa-building-o" />Sucursal</span>} key="1">
                    <h5>Selecciona sucursal para tu cita:</h5>
                    <Select className="branch-select" placeholder="Sucursal..." onChange={onBranchSelect} value={selectedBranch ? selectedBranch._id : ''}>
                        {branchesByState.length && branchesByState.map((stateBranches, idx_i) => {
                            return (
                                <Select.OptGroup key={idx_i} label={stateBranches[0].address.state}>
                                    {stateBranches.map((b, idx_j) => {
                                        return (
                                            <Select.Option key={idx_j} value={b._id}>
                                                {`${b.name}: ${b.address.street1 + (b.address.street2 ? ' ' + b.address.street2 : '')}, ${b.address.city}`}
                                            </Select.Option>
                                        );
                                    })}
                                </Select.OptGroup>
                            );
                        })}
                    </Select>
                   {showDatePicker && 
                        <div>
                            <h5>Seleccionar fecha</h5>
                            <p>Tu cita será de acuerdo según la zona horaria de:  {selectedBranch.timeZone ? selectedBranch.timeZone : ''}</p>
                            <DatePicker
                                format={"DD-MM-YYYY"} 
                                disabledDate={disabledDate}
                                showToday={false}
                                onChange={onChangeDatePicker}
                                value={datePickerValue}
                                onOpenChange={onOpenChangeDatePicker}
                            />
                    {showTimePicker && 
                            <TimePicker
                                disabledHours={disabledHours}
                                disabledMinutes={disabledMinutes}
                                hideDisabledOptions={true}
                                onChange={onChangeTimePicker}
                                format={'HH:mm'}
                                value={ timePickerValue }
                            />}
                    </div>}
                

                </Tabs.TabPane>
                {/* <Tabs.TabPane  disabled={true} tab={<span><i className="fa fa-fw fa-truck" />Envío</span>} key="2">
                </Tabs.TabPane> */}
            </Tabs>

            {showShipmentBranchError && !selectedBranch && <div className="error-span">Seleccione una sucursal</div>}
            {showShipmentDateTimeError &&(!datePickerValue || !timePickerValue) && <div className="error-span">Seleccione fecha y hora para la cita </div>}
        </div>
    );
};

Shipment.propTypes = {
    branches: PropTypes.array.isRequired,
    onBranchSelect: PropTypes.func.isRequired,
    selectedBranch: PropTypes.object,
    showShipmentBranchError: PropTypes.bool,
    showDatePicker: PropTypes.bool,
    onChangeDatePicker: PropTypes.func.isRequired,
    onChangeTimePicker: PropTypes.func.isRequired,
    showShipmentDateTimeError: PropTypes.bool,
    datePickerValue: PropTypes.object,
    onOpenChangeDatePicker: PropTypes.func.isRequired,
    timePickerValue: PropTypes.object,
    showTimePicker: PropTypes.bool
};

export default Shipment;
