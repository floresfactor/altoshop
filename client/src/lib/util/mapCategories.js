
// Intended to use recursivelly, this maps a category object to:
// {
//     value: categoryID,
//     label: category_name,
//     // Array of category ID's to travel from category1 to get to this category obj:
//     path: [category1, category1_a, category1_a_0 ... , category_path],
//     children: [{
//         <object of this same structure>
//     }]
// }
// See: categorySearchCascader.jsx to an example of this in use
export const mapSubCategoriesToChildObjects = (category) => {
    return {
        value: category._id,
        label: category.name,
        path: [...category.path, category._id],
        children: category.subCategories.map(sc => mapSubCategoriesToChildObjects(sc))
    };
};