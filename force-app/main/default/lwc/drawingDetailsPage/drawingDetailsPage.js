import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { NavigationMixin } from 'lightning/navigation';
import fetchDrawingById from '@salesforce/apex/DrawingController.fetchDrawingById';
import fetchRelatedDrawings from '@salesforce/apex/DrawingController.fetchRelatedDrawings';

export default class DrawingDetailsPage extends NavigationMixin(LightningElement) {
    @track drawings = {};
    @track drawingId;
    @track relatedDrawings = []; 

    @wire(CurrentPageReference)
    currentPageReference({ state }) {
        if (state && state.drawingId) {
            this.drawingId = state.drawingId;
            this.loadDrawingDetails();
        }
    }

    loadDrawingDetails() {
        if (this.drawingId) {
            fetchDrawingById({ drawingId: this.drawingId })
                .then(result => {
                    this.drawings = {
                        ...result,
                        code: result.Code__c,
                        features: result.Product_Features__c ? result.Product_Features__c.split('\n') : [],
                        advantages: result.Advantages__c ? result.Advantages__c.split('\n') : [],
                        operatings: result.Operating_range__c ? result.Operating_range__c.split('\n') : [],
                        materials: result.Materials__c ? result.Materials__c.split('\n') : []
                    };
                    this.loadRelatedDrawings();
                })
                .catch(error => {
                    console.error('Error fetching drawing details:', error);
                });
        }
    }

    loadRelatedDrawings() {
        fetchRelatedDrawings({ drawingId: this.drawingId })
            .then(result => {
                this.relatedDrawings = result;
            })
            .catch(error => {
                console.error('Error fetching related drawings:', error);
            });
    }

    handleRequestProduct() {
        const drawingId = this.drawings.Id;
        
        if (drawingId) {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Request_Product__c'
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
