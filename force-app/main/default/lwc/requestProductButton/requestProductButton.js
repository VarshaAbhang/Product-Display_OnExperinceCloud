import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class RequestProductButton extends NavigationMixin(LightningElement) {
    @track materialNumber = '';
    @track articleName = '';
    @track quantity = 1;

    // Track machine information visibility and button state
    @track showMachineInfo = false; // Toggle for machine information section
    buttonIcon = 'utility:add'; // Initial icon
    buttonText = 'Expand'; // Button text

    // Machine information fields
    @track application = '';
    @track machineType = '';
    @track serialNumber = '';
    @track shaftDiameter = '';
    @track rotationSpeed = '';
    @track machineTag = '';
    @track pressure = '';
    @track temperature = '';
    @track medium = '';
    @track abrasiveParticles = ''; // Store selected radio option

    // Define radio options for abrasive particles in medium (Yes/No)
    get radioOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    navigateHome() {
        this[NavigationMixin.Navigate]( {
            type: 'comm__namedPage',
            attributes: {
                name: 'Home' // Replace with your Home page's API name
            }
        });
    }

    navigateToDrawingDetail() {
        this[NavigationMixin.Navigate]( {
            type: 'comm__namedPage',
            attributes: {
                name: 'Drawing_Details__c' // Replace with your Drawing Detail page's API name
            }
        });
    }

    increaseQuantity() {
        this.quantity += 1; 
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity -= 1; 
        }
    }

    toggleInputs() {
        this.showMachineInfo = !this.showMachineInfo;
        this.buttonIcon = this.showMachineInfo ? 'utility:dash' : 'utility:add';
        this.buttonText = this.showMachineInfo ? 'Collapse' : 'Expand';
    }

    handleRadioChange(event) {
        this.abrasiveParticles = event.detail.value; // Store the selected value
    }

    handleNext() {
        // Implement logic for the next button
    }
}
