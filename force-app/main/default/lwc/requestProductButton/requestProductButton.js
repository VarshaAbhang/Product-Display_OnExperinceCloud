import { LightningElement, track } from 'lwc';
import sendProductRequest from '@salesforce/apex/ProductRequestController.sendProductRequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class RequestProductButton extends LightningElement {

    @track preferredQuantity = 1;
    @track selectedCertificates = []; 

    @track showMachineInfo = false; 
    buttonIcon = 'utility:add'; 
    buttonText = 'Expand'; 
    
    @track isAgreedToDataPolicy = false; 
    @track isNotABot = false; 

    @track showProductInfo = true;
    @track showPersonalDataForm = false
    @track showFurtherInfo = false; 

    @track formData = {
        materialNumber : '',
        articleName : '',
        application : '',
        machineType : '',
        serialNumber : '',
        shaftDiameter : '',
        rotationSpeed : '',
        machineTag : '',
        pressure : '',
        temperature : '',
        medium : '',
        abrasiveParticles : '',
        productCategory : '',
        sealingSupplySystemInput:'',
        planInput : '',
        operatingLocationInput:'',
        additionalInfoInput:'',
        //
        applicationPackaging:'',
        dimensionsSealChamberInput:'',
        movementRPMInput:'',
        geometryInput:'',
        //
        gasketgeometryInput:'',
        screwsInput:'',
        //
        othersInput:'',
        //
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        customerNumber: '',
        msgInput: ''
    };

    get titleOptions() {
        return [
            { label: 'Mr.', value: 'Mr.' },
            { label: 'Mrs.', value: 'Mrs.' },
            { label: 'Miss', value: 'Miss.' },
            { label: 'Dr.', value: 'Dr.' }
        ];
    }

    get radioOptions() {
        return [
            { label: 'Yes', value: 'Yes'},
            { label: 'No', value: 'No'}
        ];
    }

    get productCategoryOptions() {
        return [
            { label: 'Mechanical Seals', value: 'Mechanical Seals' },
            { label: 'Packings', value: 'Packings' },
            { label: 'Gaskets', value: 'Gaskets' },
            { label: 'Others', value: 'Others' }
        ];
    }

    get operatingLocationOptions() {
        return [
            { label: 'Inside', value: 'Inside' },
            { label: 'Outside', value: 'Outside' },
            { label: 'Covered (Under roof, etc.)', value: 'Covered' }
        ];
    }

    get certificateOptions() {
        return [
            { label: 'ATEX Declaration', value: 'ATEX Declaration' },
            { label: '2.1 Declaration', value: '2.1 Declaration' },
            { label: '2.2 Material Certificate', value: '2.2 Material Certificate' },
            { label: '3.1 Inspection Test Certificate of Raw Material', value: '3.1 Inspection Test Certificate of Raw Material' }
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

    get isMechanicalSeals() {
        return this.formData.productCategory === 'Mechanical Seals';
    }

    get isPackings() {
        return this.formData.productCategory === 'Packings';
    }

    get isGaskets() {
        return this.formData.productCategory === 'Gaskets';
    }

    get isOthers() {
        return this.formData.productCategory === 'Others';
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.detail.value;
        console.log('Field:', field, 'Value:', value);

        switch (field) {
            case 'preferredQuantity':
                this.preferredQuantity = value;
                break;
            case 'selectedCertificates':
                this.selectedCertificates = Array.isArray(value) ? value.join(';') : value;
                break;
            default:
                this.formData = { ...this.formData, [field]: value };
                break;
        }
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
            preferredQuantity: this.preferredQuantity,
            selectedCertificates: this.selectedCertificates || [],
            shaftDiameter: this.formData.shaftDiameter ? parseInt(this.formData.shaftDiameter, 10) : null,
            rotationSpeed: this.formData.rotationSpeed ? parseInt(this.formData.rotationSpeed, 10) : null,
            pressure: this.formData.pressure ? parseInt(this.formData.pressure, 10) : null,
            temperature: this.formData.temperature ? parseInt(this.formData.temperature, 10) : null,
            movementRPMInput: this.formData.movementRPMInput ? parseInt(this.formData.movementRPMInput, 10) : null,
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