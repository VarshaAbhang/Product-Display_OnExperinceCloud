import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
//import saveEnquiry from '@salesforce/apex/EnquiryController.saveEnquiry';


export default class RequestProductButton extends NavigationMixin(LightningElement) {
    @track materialNumber = '';
    @track articleName = '';
    @track quantity = 1;


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
    @track category = ''; // Track selected category

    // For Mechanical Seals
    @track SealingsupplysystemInput = ''; 
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
        phone: '',
        customerNumber: ''
    };

    @track msgInput = '';
    @track isAgreedToDataPolicy = false; // For the first checkbox
    @track isNotABot = false; // For the second checkbox

    get titleOptions() {
        return [
            { label: 'Mr.', value: 'Mr' },
            { label: 'Mrs.', value: 'Mrs' },
            { label: 'Miss', value: 'Miss' },
            { label: 'Dr.', value: 'Dr' }
        ];
    }

    // Define radio options for abrasive particles in medium (Yes/No)
    get radioOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
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
        this.quantity += 1; 
        console.log ('Quantity : ' +this.quantity);
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity -= 1; 
        }
        console.log ('Quantity : ' +this.quantity);
    }

    toggleInputs() {
        this.showMachineInfo = !this.showMachineInfo;
        this.buttonIcon = this.showMachineInfo ? 'utility:dash' : 'utility:add';
        this.buttonText = this.showMachineInfo ? 'Collapse' : 'Expand';
    }

    handleRadioChange(event) {
        this.abrasiveParticles = event.detail.value; // Store the selected value
    }

    handleCategoryChange(event) {
        this.category = event.detail.value; // Update the selected category
    }

    handleOperatingLocationChange(event) {
        this.operatingLocationInput = event.detail.value; // Update operating location
    }

    handleCertificatesChange(event) {
        this.selectedCertificates = event.detail.value; // Update selected certificates
    }
    

    get isMechanicalSeals() {
        return this.category === 'Mechanical Seals';
    }

    get isPackings() {
        return this.category === 'Packings';
    }

    get isGaskets() {
        return this.category === 'Gaskets';
    }

    get isOthers() {
        return this.category === 'Others';
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        console.log('Field:', field, 'Value:', event.detail.value);
        this[field] = event.detail.value; 
    }
    
    handleCheckboxChange(event) {
        const field = event.target.dataset.field; 
        console.log('Checkbox Field:', field, 'Checked:', event.target.checked); 
        this[field] = event.target.checked; 
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

    handleSendRequest()
    {
        
    }
}
