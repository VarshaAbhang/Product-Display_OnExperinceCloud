import { LightningElement, track, wire } from 'lwc';
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

   
    @wire(getObjectInfo, { objectApiName: DRAWING_OBJECT })
    drawingObjectInfo;

   
    @wire(getPicklistValues, { recordTypeId: '$drawingObjectInfo.data.defaultRecordTypeId', fieldApiName: ITEM_FAMILY_FIELD })
    itemFamilyPicklist({ data, error }) {
        if (data) {
            this.itemFamilyOptions = data.values.map(item => ({ label: item.label, value: item.value }));
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

    handleItemFamilyChange(event) {
        this.selectedItemFamily = event.detail.value;

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
}
