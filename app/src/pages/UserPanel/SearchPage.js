import React from 'react';
import AppBarWithDrawer from '../../components/AppBarWithDrawer';
import ReturnPageList from './ReturnPageList';

function SearchPage(){
    const page_list = ReturnPageList()

    return(
        <AppBarWithDrawer content={
            <div>
                Search Page
            </div>
        } 
        appBarHeader = "User Panel"
        pageList= {page_list}
        />
    )
}

export default SearchPage