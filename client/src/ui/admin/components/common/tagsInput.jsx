import React from 'react';
import PropTypes from 'prop-types';

import { WithContext as ReactTags } from 'react-tag-input';

class TagsInput extends React.Component {
  constructor(props){
    super(props);

    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleDelete(i) {
    const { tags: oldTags } = this.props;
    this.props.onRemovingTag({
     tags: oldTags.filter((tag, index) => index !== i)
    });
  }

  handleAddition(tag) {
      const { tags: oldtags } = this.props;
      this.props.onAddingTag({tags: [...oldtags, tag.text] });
  }

  handleInputChange(e){
    if(e.length > 2)
      this.props.searchSuggestions(e).then(e => console.log(e));
  }

  render(){
     const mapSuggs = (tag)=>{
       return {
         id: tag.tags,
        text: tag.tags
      }
     };
     const mapTags = (tag)=>{
       return {
         id: tag,
         text: tag
       }
     };
      return (
        <div>
          <ReactTags tags={this.props.tags ? this.props.tags.map(mapTags) : []}
            suggestions={this.props.suggestions ? this.props.suggestions.map(mapSuggs) : []}
            handleDelete={this.handleDelete}
            handleAddition={this.handleAddition}
            handleInputChange={this.handleInputChange}
            />
        </div>
      )
  }
}

TagsInput.propTypes = {
  tags: PropTypes.array.isRequired,
  suggestions: PropTypes.array.isRequired,
  searchSuggestions: PropTypes.func.isRequired,
  onAddingTag: PropTypes.func.isRequired,
  onRemovingTag: PropTypes.func.isRequired
}

export default TagsInput;