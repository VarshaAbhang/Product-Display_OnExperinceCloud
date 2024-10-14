import { LightningElement, track } from 'lwc';
import sendProductRequest from '@salesforce/apex/ProductRequestController.sendProductRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class RequestProductButton extends LightningElement {
    @track materialNumber = '';
    @track articleName = '';
    @track preferredQuantity = 1;


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
    @track abrasiveParticles = ''; 
    @track productCategory = ''; 

    // For Mechanical Seals
    @track sealingSupplySystemInput = ''; 
    @track planInput = ''; 
    @track operatingLocationInput = ''; 
    @track additionalInfoInput = ''; 
    @track selectedCertificates = []; 
    // for packing
    @track applicationInput = '';
    @track dimensionsSealChamberInput = '';
    @track movementRPMInput = '';
    @track geometryInput = '';
    //for Gaskets
    @track gasketgeometryInput = '';
    @track screwsInput = '';
    @track othersInput = '';

    @track showProductInfo = true;
    @track showPersonalDataForm = false
    @track showFurtherInfo = false; 

    @track formData = {
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        customerNumber: ''
    };

    @track msgInput = '';
    @track isAgreedToDataPolicy = false; // For the first checkbox
    @track isNotABot = false; // For the second checkbox

    get titleOptions() {
        return [
            { label: 'Mr.', value: 'Mr.' },
            { label: 'Mrs.', value: 'Mrs.' },
            { label: 'Miss', value: 'Miss.' },
            { label: 'Dr.', value: 'Dr.' }
        ];
    }

    // Define radio options for abrasive particles in medium (Yes/No)
    get radioOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
        ];
    }

    get categoryOptions() {
        return [
            { label: 'Mechanical Seals', value: 'Mechanical Seals' },
            { label: 'Packings', value: 'Packings' },
            { label: 'Gaskets', value: 'Gaskets' },
            { label: 'Others', value: 'Others' }
        ];
    }

    // Dropdown options for operating location
    get operatingLocationOptions() {
        return [
            { label: 'Inside', value: 'Inside' },
            { label: 'Outside', value: 'Outside' },
            { label: 'Covered (Under roof, etc.)', value: 'Covered' }
        ];
    }

    get certificateOptions() {
        return [
            { label: 'ATEX Declaration', value: 'atex_declaration' },
            { label: '2.1 Declaration', value: 'declaration_21' },
            { label: '2.2 Material Certificate', value: 'material_certificate' },
            { label: '3.1 Inspection Test Certificate of Raw Material', value: 'inspection_certificate' }
        ];
    }
    
    increaseQuantity() {
        this.preferredQuantity += 1; 
        console.log ('preferredQuantity : ' +this.preferredQuantity);
    }

    decreaseQuantity() {
        if (this.preferredQuantity > 1) {
            this.preferredQuantity -= 1; 
        }
        console.log ('preferredQuantity : ' +this.preferredQuantity);
    }

    toggleInputs() {
        this.showMachineInfo = !this.showMachineInfo;
        this.buttonIcon = this.showMachineInfo ? 'utility:dash' : 'utility:add';
        this.buttonText = this.showMachineInfo ? 'Collapse' : 'Expand';
    }

    handleRadioChange(event) {
        this.abrasiveParticles = event.detail.value; 
    }

    handleCategoryChange(event) {
        this.productCategory = event.detail.value; 
    }

    handleOperatingLocationChange(event) {
        this.operatingLocationInput = event.detail.value; 
    }

    handleCertificatesChange(event) {
        this.selectedCertificates = event.detail.value; 
    }
    

    get isMechanicalSeals() {
        return this.productCategory === 'Mechanical Seals';
    }

    get isPackings() {
        return this.productCategory === 'Packings';
    }

    get isGaskets() {
        return this.productCategory === 'Gaskets';
    }

    get isOthers() {
        return this.productCategory === 'Others';
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.detail.value;
        console.log('Field:', field, 'Value:', value);
    
        // Update formData
        this.formData = { ...this.formData, [field]: value };
    
        // Update materialNumber if the field is materialNumber
        if (field === 'materialNumber') {
            this.materialNumber = value;
        }
    }
    
    
    
    handleCheckboxChange(event) {
        const field = event.target.dataset.field; 
        console.log('Checkbox Field:', field, 'Checked:', event.target.checked); 
        this.formData = { 
            ...this.formData, 
            [field]: event.target.checked 
        };
    }
    
    

    handleNextForProductlData() {
        this.showProductInfo = false;
        this.showPersonalDataForm = true;
    
    }

    handleNextForPersonalData()
    {
        this.showFurtherInfo = true;
        this.showPersonalDataForm = false;
    }

    handleBack() {
        this.showProductInfo = true;
        this.showPersonalDataForm = false;
    }
    handleBackForPersonalData() {
        this.showPersonalDataForm = true;
        this.showFurtherInfo = false;
    }

    async handleSendRequest(event) {
        console.log('clicked send request', JSON.stringify(this.formData));

        let requestData = {
            ...this.formData,
            materialNumber: this.materialNumber
        };
        
        console.log('Request data:', JSON.stringify (requestData));


        try {
            const result = await sendProductRequest(requestData);
            if (result) {   
                this.showToast('Success', 'Product request sent successfully!', 'success');
            } else {
                this.showToast('Error', 'Failed to send product request.', 'error');
            }
        } catch (error) {
            
            console.error('Error sending product request:', error);
            this.showToast('Error', error.body.message || 'An error occurred while sending the request.', 'error');
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}