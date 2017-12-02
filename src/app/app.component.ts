import { Component, ViewChild, OnInit } from '@angular/core';
import { Nav } from 'ionic-angular';
import { IPage } from '../interfaces/page';
import { UserListPage } from '../pages/user-list/user-list';
import  categories  from '../helpers/categories';

@Component({
  selector: 'page-app',
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  @ViewChild(Nav) nav: Nav;

  appPages:IPage[] = [];

  infoPages: IPage[] = [ 
    { title: 'Map', name: 'TabsPage', tabName: 'MapPage', tabIndex: 0, icon: 'map' },
    { title: 'About', name: 'TabsPage', tabName: 'AboutPage', tabIndex: 1, icon: 'information-circle' }
  ];

  rootPage: string;

  ngOnInit() {
      categories.forEach((category, index) => {
         const { title, icon } = category;
         this.appPages.push({ title, name: 'UserListPage', cid: (index + 1), icon });
      });

      if(this.isInitialPage())
      {    
        const { cid, name, title } = this.appPages[0];
        this.nav.setRoot(name, { cid, title }).catch((err: any) => {
          console.log(`Didn't set nav root: ${err}`);
        });
      }
  }
    
  isInitialPage() {
     const href = document.location.href;
     const lastFragment:any = href.split('/')[href.split('/').length-1];
     return (isNaN(lastFragment) || lastFragment === '');
  }

  openPage(page: IPage) {
    const { cid, title, name, tabIndex } = page;
    let params =  { tabIndex, cid: cid || this.appPages[0].cid, title };

    if (this.nav.getActiveChildNavs().length && tabIndex != undefined) {
      this.nav.getActiveChildNavs()[0].select(tabIndex);
    } else { 
      this.nav.setRoot(name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
     }
  }

  isCategoryActive(page: IPage) {  
    const activeNav = this.nav.getActive();

    if (activeNav && activeNav.name === page.name) {
      const userListPage = activeNav.instance as UserListPage;
      const cid = userListPage.navParams.data.cid || this.appPages[0].cid;
    
      if(cid == page.cid)  return page.icon.replace('off', 'on');      
    }
    return page.icon;  
  }

  isInfoActive(page: IPage) {
    const childNav = this.nav.getActiveChildNavs()[0];

    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabName) {
        return 'primary';
      }
      return;
    }
  }
}
