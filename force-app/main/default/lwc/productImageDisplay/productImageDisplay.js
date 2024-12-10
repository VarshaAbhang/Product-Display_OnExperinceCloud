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
    
    // Pagination state
    @track pageSize = 18;
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
        } else if (error) {
            console.error('Error fetching recommended applications:', error);
        }
    }

    // Fetch Drawings dynamically with pagination
    fetchDrawingsData() {
        this.isLoading = true;
        fetchDrawings({
            itemFamily: this.selectedItemFamily || '',
            itemCategory: this.selectedItemCategory || '',
            recommendedApplicationType: this.selectedRecommendedApplicationType || '',
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        })
        .then(data => {
            this.drawings = data.map(drawing => ({
                id: drawing.Id,
                imageUrl: drawing.Drawing_Image__c,
                code: drawing.Code__c,
                features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
            }));
    
            const totalRecords = data.length;
            this.totalPages = totalRecords > 0 ? Math.ceil(totalRecords / this.pageSize) : 1;
            console.log('Total Pages:', this.totalPages);
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
        fetchDrawings({ itemFamily: '', itemCategory: '', recommendedApplicationType: '', pageNumber: this.pageNumber, pageSize: this.pageSize })
            .then(data => {
                this.drawings = data.map(drawing => ({
                    id: drawing.Id,
                    imageUrl: drawing.Drawing_Image__c,
                    code: drawing.Code__c,
                    features: drawing.Product_Features__c ? drawing.Product_Features__c.split('\n') : []
                }));
                const totalRecords = data.length;
                this.totalPages = totalRecords > 0 ? Math.ceil(totalRecords / this.pageSize) : 1;
    
            console.log('Total Pages loadImages', this.totalPages);
            })
            .catch(error => {
                console.error('Error fetching all drawings:', error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    // Handle Item Family change
    handleItemFamilyChange(event) {
        this.selectedItemFamily = event.detail.value;
        this.selectedItemCategory = null; // Reset item category when item family changes
        this.filteredItemCategoryOptions = [];

        if (this.itemCategoryOptions.controllerValues) {
            const key = this.itemCategoryOptions.controllerValues[this.selectedItemFamily];
            if (key !== undefined) {
                this.filteredItemCategoryOptions = this.itemCategoryOptions.values.filter(opt => opt.validFor.includes(key));
            }
        }

        this.fetchDrawingsData(); // Fetch updated drawings
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
