"""
Blueprint: employees.py
CRUD operations and views for Employee entities.
"""

import logging
from flask import Blueprint, render_template, request, jsonify
from modules import orion

logger = logging.getLogger(__name__)

bp = Blueprint('employees', __name__, url_prefix='')

# ============================================================================
# GET /employees - List all employees
# ============================================================================

@bp.route('/employees', methods=['GET'])
def list_employees():
    """
    Render employees list page with photo thumbnails and basic info.
    """
    try:
        employees = orion.get_entities(entity_type='Employee', limit=1000)
        
        # Get store name for each employee
        for emp in employees:
            store_id = emp.get('refStore', {}).get('value')
            if store_id:
                store = orion.get_entity(store_id)
                if store:
                    emp['store_name'] = store.get('name', {}).get('value', 'Unknown')
        
        return render_template('employees.html', employees=employees)
    except Exception as e:
        logger.error(f"Error listing employees: {e}")
        return render_template('employees.html', employees=[], error=str(e))

# ============================================================================
# GET /employees/new - Create employee form
# ============================================================================

@bp.route('/employees/new', methods=['GET'])
def new_employee():
    """
    GET /employees/new - Show form to create new employee.
    """
    return render_template('employee_form.html')

# ============================================================================
# GET /employees/<employee_id> - Employee detail page
# ============================================================================

@bp.route('/employees/<employee_id>', methods=['GET'])
def employee_detail(employee_id):
    """
    Render detailed view of an employee.
    Shows:
    - Full profile with photo
    - Contact information
    - Skills array with icons
    - Store assignment
    - Employment details
    """
    try:
        logger.debug(f"[employee_detail] Received employee_id: '{employee_id}'")
        
        if not employee_id.startswith('urn:'):
            employee_id = f"urn:ngsi-ld:Employee:{employee_id}"
        
        logger.debug(f"[employee_detail] Reconstructed URN: '{employee_id}'")
        
        employee = orion.get_entity(employee_id)
        logger.debug(f"[employee_detail] Orion returned: {employee is not None}")
        
        if not employee:
            logger.warning(f"[employee_detail] Employee NOT FOUND with URN: '{employee_id}'")
            return render_template('error.html',
                                 error='Empleado no encontrado'), 404
        
        # Get assigned store
        store_id = employee.get('refStore', {}).get('value')
        store = None
        if store_id:
            store = orion.get_entity(store_id)
        
        return render_template('employee_detail.html',
                             employee=employee,
                             store=store)
    except Exception as e:
        logger.error(f"Error fetching employee detail: {e}")
        return render_template('error.html', error=str(e)), 500

# ============================================================================
# GET /employees/<employee_id>/edit - Edit employee form
# ============================================================================

@bp.route('/employees/<employee_id>/edit', methods=['GET'])
def edit_employee_form(employee_id):
    """
    GET /employees/<employee_id>/edit - Show form to edit employee.
    """
    try:
        if not employee_id.startswith('urn:'):
            employee_id = f"urn:ngsi-ld:Employee:{employee_id}"
        
        employee = orion.get_entity(employee_id)
        if not employee:
            return render_template('error.html',
                                 error='Empleado no encontrado'), 404
        
        return render_template('employee_form.html', employee=employee)
    except Exception as e:
        logger.error(f"Error fetching employee for edit: {e}")
        return render_template('error.html', error=str(e)), 500

# ============================================================================
# POST /api/employees - Create new employee
# ============================================================================

@bp.route('/api/employees', methods=['POST'])
def create_employee():
    """
    API endpoint to create a new employee.
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('id'):
            return {'error': 'Missing required fields'}, 400
        
        # Skills should be an array
        skills = data.get('skills', [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',')]

        ref_store = data.get('refStore', '')
        if ref_store and not ref_store.startswith('urn:'):
            ref_store = f"urn:ngsi-ld:Store:{ref_store}"
        
        employee = {
            'id': data['id'] if data['id'].startswith('urn:') else f"urn:ngsi-ld:Employee:{data['id']}",
            'type': 'Employee',
            'name': orion.build_attr(data.get('name', ''), 'Text'),
            'email': orion.build_attr(data.get('email', ''), 'Text'),
            'dateOfContract': orion.build_attr(data.get('dateOfContract', ''), 'DateTime'),
            'skills': orion.build_attr(skills, 'Array'),
            'username': orion.build_attr(data.get('username', ''), 'Text'),
            'password': orion.build_attr(data.get('password', ''), 'Text'),
            'category': orion.build_attr(data.get('category', ''), 'Text'),
            'refStore': {
                'type': 'Relationship',
                'value': ref_store
            },
            'image': orion.build_attr(data.get('image', ''), 'Text')
        }
        
        success = orion.create_entity(employee)
        return {'success': success}, 201 if success else 400
    except Exception as e:
        logger.error(f"Error creating employee: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# PATCH /api/employees/<employee_id> - Update employee
# ============================================================================

@bp.route('/api/employees/<employee_id>', methods=['PATCH'])
def update_employee(employee_id):
    """
    API endpoint to update employee attributes.
    """
    try:
        if not employee_id.startswith('urn:'):
            employee_id = f"urn:ngsi-ld:Employee:{employee_id}"
        
        data = request.get_json()
        attrs = {}
        
        if 'name' in data:
            attrs['name'] = orion.build_attr(data['name'], 'Text')
        if 'email' in data:
            attrs['email'] = orion.build_attr(data['email'], 'Text')
        if 'dateOfContract' in data:
            attrs['dateOfContract'] = orion.build_attr(data['dateOfContract'], 'DateTime')
        if 'skills' in data:
            skills = data['skills']
            if isinstance(skills, str):
                skills = [s.strip() for s in skills.split(',')]
            attrs['skills'] = orion.build_attr(skills, 'Array')
        if 'username' in data:
            attrs['username'] = orion.build_attr(data['username'], 'Text')
        if 'password' in data and data.get('password'):
            attrs['password'] = orion.build_attr(data['password'], 'Text')
        if 'category' in data:
            attrs['category'] = orion.build_attr(data['category'], 'Text')
        if 'refStore' in data:
            ref_store = data.get('refStore', '')
            if ref_store and not ref_store.startswith('urn:'):
                ref_store = f"urn:ngsi-ld:Store:{ref_store}"
            attrs['refStore'] = orion.build_attr(ref_store, 'Relationship')
        if 'image' in data:
            attrs['image'] = orion.build_attr(data['image'], 'Text')
        
        if not attrs:
            return {'error': 'No attributes to update'}, 400
        
        success = orion.update_entity_attributes(employee_id, attrs)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error updating employee: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# DELETE /api/employees/<employee_id> - Delete employee
# ============================================================================

@bp.route('/api/employees/<employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    """
    API endpoint to delete an employee.
    """
    try:
        if not employee_id.startswith('urn:'):
            employee_id = f"urn:ngsi-ld:Employee:{employee_id}"
        
        success = orion.delete_entity(employee_id)
        return {'success': success}, 200 if success else 400
    except Exception as e:
        logger.error(f"Error deleting employee: {e}")
        return {'error': str(e)}, 500

# ============================================================================
# GET /api/employees - JSON list of employees
# ============================================================================

@bp.route('/api/employees', methods=['GET'])
def api_list_employees():
    """
    API endpoint returning JSON list of employees.
    """
    try:
        limit = request.args.get('limit', 1000, type=int)
        employees = orion.get_entities(entity_type='Employee', limit=limit)
        return {'employees': employees}, 200
    except Exception as e:
        logger.error(f"Error fetching employees: {e}")
        return {'error': str(e)}, 500
