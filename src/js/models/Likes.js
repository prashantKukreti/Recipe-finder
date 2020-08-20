export default class Likes{
    constructor(){
        this.likes =[];
    }

    addLike(id,title,author,image){
        const like={id,title,author,image};
        this.likes.push(like);
        // persist the data in local storage
        this.persistData();
        return like;
    }

    deleteLike(id){
        const index= this.likes.findIndex(el=> el.id === id);
        this.likes.splice(index,1);
        // persist the data in local storage
        this.persistData();
    }

    isLiked(id){
        return this.likes.findIndex(el=>el.id ===id) !== -1;
    }

    getNumLikes(id){
        return this.likes.length;
    }

    persistData(){
        localStorage.setItem('likes',JSON.stringify(this.likes));
    }

    readStorage(){
        const storage = JSON.parse(localStorage.getItem('likes'));
        // restoring likes to the ui list 
        if(storage) this.likes= storage; 
    }
}