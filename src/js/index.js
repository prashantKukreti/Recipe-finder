import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import {elements,renderLoader,clearLoader} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';


/* global state of app

- search object
-current recipe object
-shopping list object
- liked recipes

*/
const state ={};
const controlSearch = async ()=>{
// get query from view
const query = searchView.getInput();

    if(query){
        // create new search object and add it to the state
        state.search= new Search(query);
       
        // prepare ui for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        // search for recipes
        try{
            await state.search.getResults();

            // render results to ui
            clearLoader();
            searchView.renderResults(state.search.result);
            
        }catch(error){
            alert("error loading the results");
            clearLoader();
        }

        
    }
}

// add event listener for search button
elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault();
    controlSearch();

});

elements.searchResPages.addEventListener('click',e=>{
  
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage= parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }
});



// Recipe Controller


const controlRecipe = async ()=>{
    
    // get ID from Url
    const id = window.location.hash.replace('#','');
    

    if(id){
        // prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight the selected recipe
        if(state.search){
         
            searchView.highlightSelected(id);
        } 
        
        
        // create new recipe object and add it to the state
        state.recipe= new Recipe(id);

        // get recipe data
        try{
        
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

        }catch(error){
            alert("error loading the recipes");
        }
        // calculate the servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        // render recipes
         clearLoader();
         recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
    }

};
 
['hashchange','load'].forEach(event=>{window.addEventListener(event,controlRecipe)});


// List Controller
  
const controlList=()=>{
    // create a  new list if there is none
    if(!state.list) state.list = new List();

    // add each ingredient on  the list and the ui
    state.recipe.ingredients.forEach(el=>{
        const item =state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    
    });
}

// handle delete and update list items

elements.shopping.addEventListener('click',e=>{
    const id =e.target.closest('.shopping__item').dataset.itemid;
    // handle the delete button click
    if(e.target.matches('.shopping__delete,.shopping__delete *')){

        // delete from the state
        state.list.deleteItem(id);
        // delete from the uI
        listView.deleteItem(id);
        // handle the count update
    }else if(e.target.matches('.shopping__count--value')){
        const val = parseFloat(e.target.value);
        state.list.updateCount(id,val)
    }


});

// Likes Controller

const controlLike= ()=>{
    if(!state.likes)state.likes = new Likes();
    const currentID = state.recipe.id;
    // user has not yet liked the current recipe
    if(!state.likes.isLiked(currentID)){
        const newLike = state.likes.addLike(currentID,state.recipe.title,state.recipe.author,state.recipe.img);
        // toggle the like button
        
        likesView.toggleLikeButton(true);
        // add the like to the ui list
        likesView.renderLike(newLike);
        
    }
    // user has liked the current recipe previously
    else{
        //remove like from the state
        state.likes.deleteLike(currentID);
        likesView.toggleLikeButton(false);
        
        // remove like from the ui list 
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
};

// restore liked recipe on page loads
window.addEventListener('load',()=>{
    state.likes= new Likes();

    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like =>likesView.renderLike(like));
});

// handling recipe button clicks

elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease,.btn-decrease *')){
        // decrease button is clicked
        if(state.recipe.servings >1){

            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
            
        }
    }else if(e.target.matches('.btn-increase,.btn-increase *')){
        // decrease button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
        
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // add ingredients to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love,.recipe__love *')){
        // like button handled
        controlLike();
    }

});