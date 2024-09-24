import { LightningElement, track, wire } from 'lwc';
import fetchDrawings from '@salesforce/apex/DrawingController.fetchDrawings';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import DRAWING_OBJECT from '@salesforce/schema/Drawing__c'; 
import ITEM_FAMILY_FIELD from '@salesforce/schema/Drawing__c.Item_Family__c'; 
import ITEM_CATEGORY_FIELD from '@salesforce/schema/Drawing__c.Item_Category__c'; 

export default class ProductImageDisplay extends LightningElement {
    @track itemFamilyOptions = [];
    @track itemCategoryOptions = [];
    @track filteredItemCategoryOptions = [];
    @track selectedItemFamily;
    @track selectedItemCategory;
    @track drawings = [];

    @wire(getObjectInfo, { objectApiName: DRAWING_OBJECT })
    drawingObjectInfo;


    @wire(getPicklistValues, { recordTypeId: '$drawingObjectInfo.data.defaultRecordTypeId', fieldApiName: ITEM_FAMILY_FIELD })
    itemFamilyPicklist({ data, error }) {
        if (data) {
            this.itemFamilyOptions = data.values.map(item => ({ label: item.label, value: item.value }));
            this.loadImages();
        } else if (error) {
            console.error('Error fetching Item Family picklist values:', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$drawingObjectInfo.data.defaultRecordTypeId', fieldApiName: ITEM_CATEGORY_FIELD })
    itemCategoryPicklist({ data, error }) {
        if (data) {
            this.itemCategoryOptions = data; 
        } else if (error) {
            console.error('Error fetching Item Category picklist values:', error);
        }
    }

    loadImages() {
        fetchDrawings('', '')
            .then(result => {
                this.drawings = result.map(drawing => {
                    return {
                        imageUrl: drawing.Drawing_Image__c,
                        code: drawing.Code__c,
                        features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
                    };
                });
            })
            .catch(error => {
                console.error('Error fetching all drawings:', error);
            });
    }
    
    @wire(fetchDrawings, { itemFamily: '$selectedItemFamily', itemCategory: '$selectedItemCategory' })
    wiredDrawings({ data, error }) {
        if (data) {
            this.drawings = data.map(drawing => {
                return {
                    imageUrl: drawing.Drawing_Image__c,
                    code: drawing.Code__c,
                    features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
                };
            });
        } else if (error) {
            console.error('Error fetching drawings with images:', error);
        }
    }

    handleItemFamilyChange(event) {
        this.selectedItemFamily = event.detail.value;
        this.selectedItemCategory = null;
        this.filteredItemCategoryOptions = [];


        if (this.itemCategoryOptions.controllerValues) {
            const key = this.itemCategoryOptions.controllerValues[this.selectedItemFamily];

            if (key !== undefined) {
                this.filteredItemCategoryOptions = this.itemCategoryOptions.values.filter(opt => opt.validFor.includes(key));
            } else {
                this.filteredItemCategoryOptions = [];
            }
        }
    }

    handleItemCategoryChange(event) {
        this.selectedItemCategory = event.detail.value;
    }

    // get processedDrawings() {
    //     return this.drawings.map(drawing => {
    //         return {
    //             imageUrl: drawing.Drawing_Image__c,
    //             code: drawing.Code__c,
    //             features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
    //         };
    //     });
    // }
}
