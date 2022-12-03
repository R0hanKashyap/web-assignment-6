const Sequelize = require('sequelize');
var sequelize = new Sequelize('dd3fr9de0q51jh', 'lhnhrcwgzvrtzg', '28de9eebddf6969993a4bd436de326c97e01d97df6d64c8b1971ff3ecf1a27cf', {
        host: 'ec2-54-87-179-4.compute-1.amazonaws.com',
        dialect: 'postgres',
        port: 5432,
        dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published : Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});

Post.belongsTo(Category, {foreignKey: 'category'});



function initialize(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            resolve({msg: 'Successfully Connected to Database'})
        }).catch((err) => {
            reject({msg: 'Unable to connect with Database'})
        });
    });
}

function getPosts(){
    return new Promise((resolve, reject)=> {
        Post.findAll().then((posts) => {
            if (posts.length != 0) {
                resolve(posts)
            } else {
                reject({msg: 'No Results Returned'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        })
    })
}

function getPublishedPosts(){
   return new Promise((resolve, reject)=> {
        Post.findAll({ where: { published: true }}).then((posts) => {
            if (posts.length != 0) {
                resolve(posts)
            } else {
                reject({msg: 'No Data'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        })
    })
}

function getCategories(){
    return new Promise((resolve, reject)=> {
        Category.findAll().then((categories) => {
            if (categories.length != 0) {
                resolve(categories)
            } else {
                reject({msg: 'No Data'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        }) 
    })
}

function addPost(postData){
    return new Promise((resolve, reject)=> {
        if(postData!= null){
            for (const prop in postData) {
                if(prop == ""){
                    postData[prop] = null;
                }
            }
            postData.published = (postData.published) ? true : false;
            postData.postDate = formatDate(new Date())
            Post.create(postData).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject({ msg: 'unable to create post' })
            })
            
        } else {
            reject({msg: 'No Data'})
        }
    })
}

function getPostById(id){
    return new Promise((resolve, reject)=> {
        Post.findAll({ where: { id: id }}).then((posts) => {
            if (posts.length != 0) {
                resolve(posts[0])
            } else {
                reject({msg: 'No Data'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        }) 
     })
 }

 function getPostsByCategory(category){
    return new Promise((resolve, reject)=> {
        Post.findAll({ where: { category: category }}).then((posts) => {
            if (posts.length != 0) {
                resolve(posts)
            } else {
                reject({msg: 'No Data'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        }) 
     })
 }

 function getPostsByMinDate(minDateStr){
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject)=> {
        Post.findAll({ where: { postDate: { [gte]: new Date(minDateStr)} }}).then((posts) => {
            if (posts.length != 0) {
                resolve(posts)
            } else {
                reject({msg: 'No Data'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        }) 
     })
 }

 function getPublishedPostsByCategory(category){
    return new Promise((resolve, reject)=> {
        Post.findAll({ where: { published: true, category: category }}).then((posts) => {
            if (posts.length != 0) {
                resolve(posts)
            } else {
                reject({msg: 'No Data'})
            }
        }).catch(() => {
            reject({msg: 'No Results Returned'})
        }) 
    })
 }



 function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function addCategory(categoryData){
    return new Promise((resolve, reject)=> {
        if(categoryData != null){
            if(categoryData.category == ""){
                categoryData.category = null;
            }
            Category.create(categoryData).then((data) => {
                resolve(data)
            }).catch((err) => {
                reject({ msg: 'unable to create post' })
            })
        } else {
            reject({msg: 'No Data'})
        }
    })
}

function deletePostById(id){
    return new Promise((resolve, reject)=> {
        Post.destroy({ where: { id: id }}).then(() => {
            resolve()
        }).catch((err) => {
            console.log(err)
            reject({msg: 'No Results Returned'})
        }) 
     })
}

function deleteCategoryById(id){
    return new Promise((resolve, reject)=> {
        Category.destroy({ where: { id: id }}).then(() => {
            resolve()
        }).catch((err) => {
            console.log(err)
            reject({msg: 'No Results Returned'})
        }) 
     })
}



module.exports = { initialize, getPosts, getPublishedPosts, getCategories, addPost, getPostById, getPostsByCategory, getPostsByMinDate, getPublishedPostsByCategory, addCategory, deletePostById, deleteCategoryById }