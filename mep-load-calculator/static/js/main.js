// /mep-load-calculator/mep-load-calculator/static/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const projectActionSelect = document.getElementById('projectAction');
    const existingProjectSection = document.getElementById('existingProjectSection');
    const existingSheetSelect = document.getElementById('existingSheetSelect');
    const existingProjectSelect = document.getElementById('existingProjectSelect');
    const loadProjectBtn = document.getElementById('loadProjectBtn');
    const form = document.getElementById('loadCalculationForm');
    const isUpdateInput = document.getElementById('isUpdate');
    const originalProjectNameInput = document.getElementById('originalProjectName');
    const resultDiv = document.getElementById('result');
    const resetBtn = document.getElementById('resetBtn');
    
    // Projects data from server
    let projectsData = {};
    
    // Initialize the page
    initPage();
    
    function initPage() {
        // Check if URL has edit parameters
        const urlParams = new URLSearchParams(window.location.search);
        const isEdit = urlParams.get('edit') === 'true';
        const sheetParam = urlParams.get('sheet');
        const projectParam = urlParams.get('project');
        
        // Hide existing project section initially (unless editing)
        if (existingProjectSection) {
            if (isEdit && sheetParam && projectParam) {
                existingProjectSection.classList.remove('hidden');
                if (projectActionSelect) projectActionSelect.value = 'existing';
            } else {
                existingProjectSection.classList.add('hidden');
            }
        }
        
        // Extract projects data from server-rendered template
        try {
            const projectsElement = document.getElementById('projectsData');
            if (projectsElement) {
                projectsData = JSON.parse(projectsElement.textContent);
                
                // If editing, auto-select project
                if (isEdit && sheetParam && projectParam) {
                    setTimeout(() => {
                        if (existingSheetSelect) existingSheetSelect.value = sheetParam;
                        populateProjectDropdown();
                        setTimeout(() => {
                            if (existingProjectSelect) existingProjectSelect.value = projectParam;
                            if (loadProjectBtn) loadProjectBtn.click();
                        }, 100);
                    }, 100);
                }
            }
        } catch (e) {
            console.error('Error parsing projects data:', e);
        }
        
        // Set up event listeners
        if (projectActionSelect) {
            projectActionSelect.addEventListener('change', handleProjectActionChange);
        }
        
        if (existingSheetSelect) {
            existingSheetSelect.addEventListener('change', populateProjectDropdown);
        }
        
        if (loadProjectBtn) {
            loadProjectBtn.addEventListener('click', loadProjectData);
        }
        
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', resetForm);
        }
        
        // Add input validation for numeric fields
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', validateNumericInput);
        });
    }
    
    function handleProjectActionChange() {
        if (projectActionSelect.value === 'existing') {
            existingProjectSection.classList.remove('hidden');
            populateProjectDropdown();
        } else {
            existingProjectSection.classList.add('hidden');
            isUpdateInput.value = "false";
            originalProjectNameInput.value = "";
            resetForm();
        }
    }
    
    function populateProjectDropdown() {
        // Clear existing options
        existingProjectSelect.innerHTML = '<option value="">-- Select a project --</option>';
        
        const selectedSheet = existingSheetSelect.value;
        if (!selectedSheet || !projectsData[selectedSheet]) return;
        
        // Add options for each project in the selected sheet
        projectsData[selectedSheet].forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            existingProjectSelect.appendChild(option);
        });
    }
    
    function loadProjectData() {
        const sheetName = existingSheetSelect.value;
        const projectName = existingProjectSelect.value;
        
        if (!sheetName || !projectName) {
            showNotification('Please select both a sheet and a project', 'warning');
            return;
        }
        
        // Show loading state
        loadProjectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loadProjectBtn.disabled = true;
        
        // Make AJAX request to get project data
        fetch(`/get_project_data?sheet_name=${encodeURIComponent(sheetName)}&project_name=${encodeURIComponent(projectName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Project not found');
                }
                return response.json();
            })
            .then(data => {
                // Fill form with project data
                document.getElementById('sheetSelect').value = sheetName;
                document.getElementById('projectName').value = data['Project Name'];
                document.getElementById('area').value = data['Area (sq.ft)'];
                if (data['Occupancy Type']) {
                    document.getElementById('occupancy').value = data['Occupancy Type'];
                }
                document.getElementById('equipmentLoad').value = data['Equipment Load (kW)'];
                document.getElementById('lightingLoad').value = data['Lighting Load (kW)'];
                document.getElementById('hvacLoad').value = data['HVAC Load (kW)'];
                document.getElementById('safetyFactor').value = data['Safety Factor'];
                
                // Set update flag
                isUpdateInput.value = "true";
                originalProjectNameInput.value = data['Project Name'];
                
                showNotification('Project data loaded successfully', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error loading project data: ' + error.message, 'error');
            })
            .finally(() => {
                // Reset button state
                loadProjectBtn.innerHTML = '<i class="fas fa-download"></i> Load Project Data';
                loadProjectBtn.disabled = false;
            });
    }
    
    function handleFormSubmit(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            showNotification('Please correct the errors in the form', 'error');
            return;
        }
        
        // Show loading state on submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        const formData = new FormData(form);
        
        fetch('/calculate', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Show success message
                showNotification('Calculation successful!', 'success');
                
                // Create download link
                const downloadLink = document.createElement('a');
                downloadLink.href = data.file_url;
                downloadLink.download = 'mep_load_calculation.xlsx';
                downloadLink.click();
                
                // Reset form if it was a new project
                if (formData.get('is_update') === 'false') {
                    resetForm();
                }
            } else {
                showNotification('Error: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred. Please try again later.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }
    
    function validateForm() {
        const inputs = form.querySelectorAll('input[type="number"], input[type="text"][required]');
        let isValid = true;
        
        inputs.forEach(function(input) {
            if (input.type === 'number') {
                if (input.value === '' || isNaN(parseFloat(input.value)) || parseFloat(input.value) < 0) {
                    isValid = false;
                    input.classList.add('error');
                    showInputError(input, 'Please enter a valid positive number');
                } else {
                    input.classList.remove('error');
                    hideInputError(input);
                }
            } else if (input.required && !input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                showInputError(input, 'This field is required');
            } else {
                input.classList.remove('error');
                hideInputError(input);
            }
        });
        
        return isValid;
    }
    
    function validateNumericInput(event) {
        const input = event.target;
        if (input.value && (isNaN(parseFloat(input.value)) || parseFloat(input.value) < 0)) {
            input.classList.add('error');
            showInputError(input, 'Please enter a valid positive number');
        } else {
            input.classList.remove('error');
            hideInputError(input);
        }
    }
    
    function showInputError(input, message) {
        // Remove any existing error message
        hideInputError(input);
        
        // Create and insert error message
        const errorSpan = document.createElement('span');
        errorSpan.className = 'input-error';
        errorSpan.textContent = message;
        input.parentNode.appendChild(errorSpan);
    }
    
    function hideInputError(input) {
        const errorSpan = input.parentNode.querySelector('.input-error');
        if (errorSpan) {
            errorSpan.remove();
        }
    }
    
    function resetForm() {
        form.reset();
        
        // Reset error states
        form.querySelectorAll('.error').forEach(element => {
            element.classList.remove('error');
        });
        
        // Reset error messages
        form.querySelectorAll('.input-error').forEach(element => {
            element.remove();
        });
        
        // Reset update flags
        isUpdateInput.value = "false";
        originalProjectNameInput.value = "";
    }
    
    function showNotification(message, type = 'info') {
        // Check if notification container exists, create if not
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on notification type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        if (type === 'error') icon = 'times-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Add event listener for close button
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.remove();
        });
        
        // Auto remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Add animation class
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }
});