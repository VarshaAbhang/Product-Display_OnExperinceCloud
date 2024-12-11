import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import fetchDrawingById from '@salesforce/apex/DrawingController.fetchDrawingById';
import fetchRelatedDrawings from '@salesforce/apex/DrawingController.fetchRelatedDrawings';
import fetchGroupedFeaturesByDrawingId from '@salesforce/apex/DrawingController.fetchGroupedFeaturesByDrawingId';
import sendProductRequest from '@salesforce/apex/ProductRequestController.sendProductRequest';
import getCountryGlobalPicklistValues from '@salesforce/apex/ProductRequestController.getCountryGlobalPicklistValues';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class DrawingDetailsPage extends NavigationMixin(LightningElement) {
    @track drawings = {
        featuresGroupedByType: {}
    };
    @track featureTypesWithValues = [];
    @track drawingId;
    @track relatedDrawings = [];
    @track isModalOpen = false;
    @track countryOptions = [];
    @track isLoading = false;
    @track formData = {
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        country: '',
        companyName: '',
        productName: '',
        productFamily: '',
        msgInput: '',
        website: ''
    };

    // Pagination variables
    @track currentPage = 1;
    @track itemsPerPage = 4;  // Adjust based on your requirement
    @track totalPages = 0;

    get titleOptions() {
        return [
            { label: 'Mr.', value: 'Mr.' },
            { label: 'Mrs.', value: 'Mrs.' },
            { label: 'Miss', value: 'Miss.' },
            { label: 'Dr.', value: 'Dr.' }
        ];
    }


    get productFamilyOptions() {
        return [
            { label: 'Mechanical Seal', value: 'Mechanical Seal' },
            { label: 'MS Spares', value: 'MS Spares' },
            { label: 'Seal Support Systems', value: 'Seal Support Systems' }
        ];
    }

    get paginatedDrawings() {
        if (!this.relatedDrawings || this.relatedDrawings.length === 0) {
            return [];
        }
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = this.currentPage * this.itemsPerPage;
        return this.relatedDrawings.slice(start, end);
    }
    

    @wire(CurrentPageReference)
    currentPageReference(pageRef) {
        if (pageRef && pageRef.state && pageRef.state.drawingId) {
            this.drawingId = pageRef.state.drawingId;
            this.loadDrawingDetails();
        }
    }

    connectedCallback() {
        this.isLoading = true;
        this.fetchCountryOptions();
    }

    async fetchCountryOptions() {
        try {
            const countries = await getCountryGlobalPicklistValues();
            this.countryOptions = countries.map(country => ({
                label: country,
                value: country
            }));
        } catch (error) {
            console.error('Error fetching country picklist values:', error);
            this.showToast('Error', 'Failed to load country options.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    loadDrawingDetails() {
        if (this.drawingId) {
            fetchDrawingById({ drawingId: this.drawingId })
                .then(result => {
                    this.drawings = {
                        ...result,
                        code: result.Code__c,
                        advantages: result.Advantages__c ? result.Advantages__c.split('\n') : [],
                        featuresGroupedByType: {}
                    };

                    // Fetch grouped features
                    this.fetchGroupedFeatures();
                    this.loadRelatedDrawings();
                })
                .catch(error => {
                    console.error('Error fetching drawing details:', error);
                    this.showToast('Error', 'Failed to load drawing details.', 'error');
                });
        }
    }

    fetchGroupedFeatures() {
        fetchGroupedFeaturesByDrawingId({ drawingId: this.drawingId })
            .then(result => {
                console.log('Fetched Grouped Features:', JSON.stringify(result));
                this.drawings.featuresGroupedByType = result || {};

                this.featureTypesWithValues = Object.keys(this.drawings.featuresGroupedByType).map(type => ({
                    type,
                    features: this.drawings.featuresGroupedByType[type]
                }));
            })
            .catch(error => {
                console.error('Error fetching grouped features:', error);
                this.showToast('Error', 'Failed to load grouped features.', 'error');
            });
    }
    

    loadRelatedDrawings() {
    fetchRelatedDrawings({ drawingId: this.drawingId })
        .then(result => {
            this.relatedDrawings = result;
            this.totalPages = Math.ceil(this.relatedDrawings.length / this.itemsPerPage); 
            console.log('Related Drawings Length:', this.relatedDrawings.length);
        })
        .catch(error => {
            console.error('Error fetching related drawings:', error);
            this.showToast('Error', 'Failed to load related drawings.', 'error');
        });
}
    
    handleRequestProduct() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this.formData = { ...this.formData, [field]: value };
    }

    validateFields() {
        const allInputs = [...this.template.querySelectorAll('lightning-input, lightning-combobox')];
        return allInputs.reduce((valid, input) => input.checkValidity() && valid, true);
    }

    async handleSendRequest() {
        if (!this.validateFields()) {
            this.showToast('Error', 'Please complete all required fields.', 'error');
            return;
        }

        this.isLoading = true;

        try {
            const result = await sendProductRequest({ requestWrapper: JSON.stringify(this.formData) });

            if (result) {
                console.log('Product request sent successfully');
                this.showToast('Success', 'Product request sent successfully!', 'success');
                this.resetForm();
                this.isModalOpen = false;
            } else {
                this.showToast('Error', 'Failed to send product request.', 'error');
            }
        } catch (error) {
            console.error('Error sending product request:', error);
            this.showToast('Error', error?.body?.message || 'An unknown error occurred.', 'error');
        } finally {
            this.isLoading = false;
        }
    }
    

    resetForm() {
        this.formData = {
            title: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            country: '',
            companyName: '',
            productName: '',
            productFamily: '',
            msgInput: '',
            website: ''
        };
    }

    showToast(title, message, variant) {
        console.log('Showing toast:', { title, message, variant });
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

    handleBackpage()
    {
        const drawingId = this.drawings.Id;

        if (drawingId) {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Home'
                },
                state: {
                    drawingId: drawingId
                }
            });
        } else {
            console.error('Drawing ID not found');
        }
    }

    handleRelatedImageClick(event) {
        const drawingId = event.target.dataset.id;
        console.log('Related Image clicked. Drawing ID:', drawingId);

        if (drawingId) {
            
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Drawing_Details__c', 
                },
                state: {
                    drawingId: drawingId, 
                }
            });
        } else {
            console.error('Drawing ID not found in the clicked image.');
        }
    }

    // Pagination methods
    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    get isPreviousDisabled() {
        return this.currentPage === 1;  
    }
    
    get isNextDisabled() {
        return this.currentPage === this.totalPages; 
    }
      
}
