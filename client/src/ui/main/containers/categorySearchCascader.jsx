import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { connect } from 'react-redux';

// Actions
import { setSearch } from '../../../actions/UICascaderInputActions';
import { setUICategorySelections } from '../../../actions/UICategorySelectionActions';

// Components
import CategoryCascader from '../components/categorySearchCascader/categoryCascader.jsx';

class CategorySearchCascader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: props.UICascaderInput.search
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.UICascaderInput !== this.props.UICascaderInput) {
            this.setState({ searchValue: nextProps.UICascaderInput.search });
        }
    }

    onCategoryCascaderChange(path, categoriesOnPath) {
        this.props.setUICategorySelections({
            selectedCategoryPath: path
        });
    }

    onInputSearchChange(evt) {
        this.setState({ searchValue: evt.target.value });
    }

    onInputSearchEnter() {
        const { setSearch, UICascaderInput: { search: reduxStateSearchVal } } = this.props;
        const { searchValue } = this.state;

        if (searchValue != reduxStateSearchVal)
            setSearch(searchValue);
    }

    onInputSearchClear() {
        const { setSearch, UICascaderInput: { search: reduxStateSearchVal } } = this.props;

        if (reduxStateSearchVal)
            setSearch(null);

        this.setState({ searchValue: null });
    }

    render() {
        const { selectedCategoryPath, recursiveCategories } = this.props;
        const { searchValue } = this.state;

        const inputAddonBefore = (
            <CategoryCascader recursiveCategories={recursiveCategories}
                onCascaderChange={this.onCategoryCascaderChange.bind(this)}
                selectedCategoryPath={selectedCategoryPath} />
        );

        const inputSuffix = searchValue ? (
            <i className="fa fa-fw fa-times input-cross-suffix"
                onClick={this.onInputSearchClear.bind(this)} />
        ) : null;

        return (
            <div className="category-search-cascader">
                <Input addonBefore={inputAddonBefore} suffix={inputSuffix}
                    value={searchValue} onChange={this.onInputSearchChange.bind(this)}
                    onPressEnter={this.onInputSearchEnter.bind(this)} />
            </div>
        );
    }
};

CategorySearchCascader.propTypes = {
    recursiveCategories: PropTypes.array,
    setUICategorySelections: PropTypes.func.isRequired,
    selectedCategoryPath: PropTypes.arrayOf(PropTypes.string),
    UICascaderInput: PropTypes.object.isRequired,
    setSearch: PropTypes.func.isRequired
};


const mapStateToProps = (state) => {
    return {
        recursiveCategories: state.recursiveCategories,
        selectedCategoryPath: state.UICategorySelections.selectedCategoryPath || [],
        UICascaderInput: state.UICascaderInput
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUICategorySelections: (UIObj) => {
            dispatch(setUICategorySelections(UIObj));
        },
        setSearch: (searchVal) => {
            dispatch(setSearch(searchVal));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CategorySearchCascader);