import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import fetchDrawings from '@salesforce/apex/DrawingController.fetchDrawings';
import fetchRecommendedApplicationNames from '@salesforce/apex/DrawingController.fetchRecommendedApplicationNames';
import getCurrentUserProfile from '@salesforce/apex/DrawingController.getCurrentUserProfile';
import DRAWING_OBJECT from '@salesforce/schema/Drawing__c'; 
import DRAWING_DETAILS_OBJECT from '@salesforce/schema/Drawing_Details__c';
import ITEM_FAMILY_FIELD from '@salesforce/schema/Drawing__c.Item_Family__c'; 
import ITEM_CATEGORY_FIELD from '@salesforce/schema/Drawing__c.Item_Category__c'; 

export default class ProductImageDisplay extends NavigationMixin(LightningElement) {
    @track itemFamilyOptions = [];
    @track itemCategoryOptions = [];
    @track filteredItemCategoryOptions = [];
    @track selectedItemFamily;
    @track selectedItemCategory;
    @track recommendedApplicationOptions = [];
    @track selectedRecommendedApplicationType;
    @track drawings = [];
    @track userProfile;
    @track isLoading = false;

    @wire(getCurrentUserProfile)
    wiredUserProfile({ data, error }) {
        if (data) {
            this.userProfile = data;
        } else if (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    @wire(getObjectInfo, { objectApiName: DRAWING_OBJECT })
    drawingObjectInfo;


    @wire(getObjectInfo, { objectApiName: DRAWING_DETAILS_OBJECT })
    drawingdetailObjectInfo;

    @wire(getPicklistValues, { recordTypeId: '$drawingObjectInfo.data.defaultRecordTypeId', fieldApiName: ITEM_FAMILY_FIELD })
    itemFamilyPicklist({ data, error }) {
        if (data) {
            this.itemFamilyOptions = data.values.map(item => ({ label: item.label, value: item.value }));

            // // Filter out "MS Spares" for certain profiles
            // if (this.userProfile === 'System Administrator' || this.userProfile === 'Products Profile') {
            //     this.itemFamilyOptions = this.itemFamilyOptions.filter(option => option.value !== 'MS Spares');
            // }

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

    @wire(fetchRecommendedApplicationNames)
    wiredRecommendedApplications({ data, error }) {
    if (data) {
        this.recommendedApplicationOptions = Array.from(
            new Map(data.map(item => [item, item])).values()
        ).map(name => ({
            label: name, value: name
        }));

        console.log('Recommended app:', this.recommendedApplicationOptions);
    } else if (error) {
        console.error('Error fetching recommended applications:', error);
    }
}
    
loadImages() {
        this.isLoading = true;
        fetchDrawings('', '', '')
            .then(result => {
                this.drawings = result.map(drawing => ({
                    id: drawing.Id, 
                    imageUrl: drawing.Drawing_Image__c,
                    code: drawing.Code__c,
                    features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
                }));
            })
            .catch(error => {
                console.error('Error fetching all drawings:', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    @wire(fetchDrawings, { 
        itemFamily: '$selectedItemFamily', 
        itemCategory: '$selectedItemCategory', 
        //recommendedApplicationType: '$selectedRecommendedApplicationType' 
    })
    wiredDrawings({ data, error }) {
        this.isLoading = true;
        if (data) {
            this.drawings = data.map(drawing => ({
                id: drawing.Id, 
                imageUrl: drawing.Drawing_Image__c,
                code: drawing.Code__c,
                features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
            }));
        } else if (error) {
            console.error('Error fetching drawings with images:', error);
        }
        this.isLoading = false;
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
    
    handleRecommendedApplicationChange(event) {
        this.selectedRecommendedApplicationType = event.detail.value;
        this.loadImages();
    }
    
    handleImageClick(event) {
        const drawingId = event.target.dataset.id; 
        console.log('Image clicked. Drawing ID:', drawingId);
    
        if (drawingId) {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Drawing_Details__c' 
                },
                state: {
                    drawingId: drawingId 
                }
            });
        } else {
            console.error('Drawing ID not found');
        }
    }
}
