import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import fetchDrawings from '@salesforce/apex/DrawingController.fetchDrawings';
import fetchRecommendedApplicationNames from '@salesforce/apex/DrawingController.fetchRecommendedApplicationNames';
import fetchGroupedFeaturesByDrawingId from '@salesforce/apex/DrawingController.fetchGroupedFeaturesByDrawingId';
import fetchProductTypeValues from '@salesforce/apex/DrawingController.fetchProductTypeValues';
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
    @track itemCategoryData = null; 
    @track recommendedApplicationOptions = [];
    @track selectedRecommendedApplicationType;
    @track selectedProductType;
    @track productTypeOptions = [];
    @track drawings = [];
    @track userProfile;
    @track isLoading = false;
    
    // Pagination state
    @track pageSize = 30;
    @track pageNumber = 1;
    @track totalPages = 1;

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
            this.itemFamilyOptions = [{ label: 'Select Family', value: '' }]
                .concat(data.values.map(item => ({ label: item.label, value: item.value })));
             // Filter out "MS Spares" for certain profiles
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
        this.itemCategoryData = data;
        this.itemCategoryOptions = [{ label: 'Select Category', value: '' }]
            .concat(data.values.map(item => ({ label: item.label, value: item.value })));
    } else if (error) {
        console.error('Error fetching Item Category picklist values:', error);
    }
}

    @wire(fetchRecommendedApplicationNames)
    wiredRecommendedApplications({ data, error }) {
        if (data) {
        
            this.recommendedApplicationOptions = [{ label: 'Select Application', value: '' }]
                .concat(Array.from(new Map(data.map(item => [item, item])).values()).map(name => ({
                    label: name, value: name
                })));
        } else if (error) {
            console.error('Error fetching recommended applications:', error);
        }
    }

    @wire(fetchProductTypeValues)
    wiredProductTypeNames({ data, error }) {
        if (data) {
            this.productTypeOptions = Array.from(
                new Map(data.map(item => [item, item])).values()
            ).map(name => ({
                label: name, value: name
            }));
        } else if (error) {
            console.error('Error fetching product names:', error);
        }
    }

    // Fetch Drawings dynamically with pagination
    fetchDrawingsData() {
        this.isLoading = true;
        fetchDrawings({
            itemFamily: this.selectedItemFamily || '',
            itemCategory: this.selectedItemCategory || '',
            recommendedApplicationType: this.selectedRecommendedApplicationType || '',
            productType: this.selectedProductType || '',
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        })
        .then(data => {
            this.drawings = data.map(drawing => ({
                id: drawing.Id,
                imageUrl: drawing.Drawing_Image__c,
                code: drawing.Code__c,
                features: [] // Initialize an empty array for features
            }));
    
            // Fetch features for each drawing
            const featurePromises = this.drawings.map(drawing => {
                return fetchGroupedFeaturesByDrawingId({ drawingId: drawing.id })
                    .then(groupedFeatures => {
                        if (groupedFeatures['Features']) {
                            drawing.features = groupedFeatures['Features'];
                        }
                    })
                    .catch(error => {
                        console.error(`Error fetching features for Drawing ID: ${drawing.id}`, error);
                    });
            });
    
            return Promise.all(featurePromises);
        })
        .then(() => {
           // const totalImages = this.drawings.filter(drawing => drawing.imageUrl).length;
           // console.log('Total images with Drawing_Image__c after filtering:', totalImages);
    
            const totalRecords = this.drawings.length;
            this.totalPages = totalRecords > 0 ? Math.ceil(totalRecords / this.pageSize) : 1;
    
            //console.log('Total Pages after filtering:', this.totalPages);
        })
        .catch(error => {
            console.error('Error fetching drawings:', error);
        })
        .finally(() => {
            this.isLoading = false;
        });
    }
    
    // Load all images initially
    loadImages() {
        this.isLoading = true;
        fetchDrawings({ itemFamily: '', itemCategory: '', recommendedApplicationType: '', productType: '', pageNumber: this.pageNumber, pageSize: this.pageSize })
            .then(data => {
                this.drawings = data.map(drawing => ({
                    id: drawing.Id,
                    imageUrl: drawing.Drawing_Image__c,
                    code: drawing.Code__c,
                    //advantages: drawing.Advantages__c ? drawing.Advantages__c.split('\n') : [],
                    features: [] 
                }));
    
                const featurePromises = this.drawings.map(drawing => {
                    return fetchGroupedFeaturesByDrawingId({ drawingId: drawing.id })
                        .then(groupedFeatures => {
                            // Filter for "Feature" type and map the names
                            if (groupedFeatures['Features']) {
                                drawing.features = groupedFeatures['Features'];
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching features for Drawing ID: ${drawing.id}`, error);
                        });
                });
    
                return Promise.all(featurePromises);
            })
            .then(() => {
               // const totalImages = this.drawings.filter(drawing => drawing.imageUrl).length;
               // console.log('Total images with Drawing_Image__c:', totalImages);
    
                const totalRecords = this.drawings.length;
                this.totalPages = totalRecords > 0 ? Math.ceil(totalRecords / this.pageSize) : 1;
    
                //console.log('Total Pages loadImages', this.totalPages);
            })
            .catch(error => {
                console.error('Error fetching all drawings:', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleItemFamilyChange(event) {
        this.selectedItemFamily = event.detail.value;
        this.selectedItemCategory = '';
        this.filteredItemCategoryOptions = [{ label: 'Select Category', value: '' }];
      
    
        // Check if itemCategoryData is valid
        if (this.itemCategoryData && this.itemCategoryData.controllerValues) {
            const controllerKey = this.itemCategoryData.controllerValues[this.selectedItemFamily];
            if (controllerKey !== undefined) {
                this.filteredItemCategoryOptions = this.filteredItemCategoryOptions.concat(
                    this.itemCategoryData.values.filter(opt => opt.validFor.includes(controllerKey))
                        .map(opt => ({ label: opt.label, value: opt.value }))
                );
            }
        }
        this.fetchDrawingsData();
    }

    // Handle Item Category change
    handleItemCategoryChange(event) {
        this.selectedItemCategory = event.detail.value;
        this.fetchDrawingsData(); // Fetch updated drawings
    }

    // Handle Recommended Application change
    handleRecommendedApplicationChange(event) {
        this.selectedRecommendedApplicationType = event.detail.value;
        this.fetchDrawingsData(); // Fetch updated drawings
    }

    handleproductTypeChange(event) {
        this.selectedProductType = event.detail.value;
        this.fetchDrawingsData(); 
    }

    // Handle Next Page
    handleNextPage() {
        if (this.pageNumber < this.totalPages) {
            this.pageNumber++;
            this.fetchDrawingsData();
        }
    }

    // Handle Previous Page
    handlePreviousPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.fetchDrawingsData();
        }
    }

    get isPreviousDisabled() {
        return this.pageNumber === 1;
    }
    
    get isNextDisabled() {
        return this.pageNumber === this.totalPages;
    }    

    // Handle Image Click for Navigation
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
