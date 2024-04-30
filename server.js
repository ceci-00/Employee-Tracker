// import the required modules
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const fs = require('fs');
const { connect } = require('http2');
// declaring database connection
let db;
// function to connect to the database
const connectToDatabase = async () => {
    try {
        // connecting to the database
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'pw12',
            database: 'departments_db'
        });
        console.log('Connected to the departments_db database.');
        // seeding the database
        await seedDatabase();
        mainMenu();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};
// function to seed the database
const seedDatabase = async () => {
    try {
        // reading the seeds.sql file
        const seed = fs.readFileSync('./assets/db/seeds.sql').toString();
        // executing the seeds file
        await db.query(seed);
        console.log('Database seeded!');
    } catch (err) {
        console.error('Error seeding the database:', err);
    }
};
// main menu function
const mainMenu = async () => {
    try {
        // prompting the user to select an option
        const { choice } = await inquirer.prompt({
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'View Employees by Manager', 'View Employees by Department', 'Add Employee', 'Add Department', 'Add Role', 'Update Employee Role', 'Update Employee Manager', 'Delete Department', 'Delete Role', 'Delete Employee', 'Quit']
        });
        // switch case to execute the selected option
        switch (choice) {
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'View Employees by Manager':
                viewEmployeesByManager();
                break;
            case 'View Employees by Department':
                viewEmployeesByDepartment();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Update Employee Manager':
                updateEmployeeManager();
                break;
            case 'Delete Department':
                deleteDepartment();
                break;
            case 'Delete Role':
                deleteRole();
                break;
            case 'Delete Employee':
                deleteEmployee();
                break;
            case 'Quit':
                process.exit();
        }
    } catch (err) {
        console.error('Error in main menu:', err);
    }
};
// View all departments function
const viewAllDepartments = async () => {
    try {
        console.log('Viewing all departments...\n');
        // Fetch all departments from the database
        const [rows] = await db.query('SELECT * FROM department');
        // Display all departments in a table format
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in view all departments:', err);
    }
}
// View all roles function
const viewAllRoles = async () => {
    try {
        console.log('Viewing all roles...\n');
        // Fetch all roles from the database
        const [rows] = await db.query(
            `SELECT
        r.id AS 'Role ID',
        r.title AS 'Job Title',
        d.name AS 'Department',
        r.salary AS 'Salary'
      FROM
        roles r
      LEFT JOIN
        department d ON r.department_id = d.id;`
        );
        // Display all roles in a table format
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in view all roles:', err);
    }
};
// View all employees function
const viewAllEmployees = async () => {
    try {
        console.log('Viewing all employees...\n');
        // Fetch all employees from the database
        const [rows, fields] = await db.query(
            `SELECT
        e.id AS 'Employee ID',
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Job Title',
        d.name AS 'Department',
        r.salary AS 'Salary',
        CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;`
        );
        console.log('All Employees:');
        // Display all employees in a table format
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error viewing all employees:', err);
    }
}
// View employees by manager function
const viewEmployeesByManager = async () => {
    try {
        console.log('Viewing employees by manager...\n');
        // Fetch all employees and their managers from the database
        const [rows] = await db.query(`
      SELECT
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Role',
        CONCAT(m.first_name, ' ', m.last_name) AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN employee m ON e.manager_id = m.id
      WHERE
        e.manager_id IS NOT NULL;
    `);
        // Display the employees by manager
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in view employees by manager:', err);
    }
}
// View employees by department function
const viewEmployeesByDepartment = async () => {
    try {
        console.log('Employees by Department:');
        // Fetch all employees and their departments from the database
        const [rows, fields] = await db.query(
            `SELECT
        e.first_name,
        e.last_name,
        d.name AS department
        FROM
        employee e
        JOIN roles r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id;`
        );
        // Display the employees by department
        console.table(rows);
    } catch (err) {
        console.error('Error viewing employees by department:', err);
    }
}
// Add an employee function
const addEmployee = async () => {
    try {
        console.log('Adding employee...\n');
        // Fetch all roles and employees from the database
        const [roles] = await db.query('SELECT * FROM roles');
        const [employees] = await db.query('SELECT * FROM employee');
        // Create array of role choices for the user to select from
        const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
        // Create array of employee choices for the user to select from
        const managerChoices = employees.map(employee => ({ name: `${employee.first_name} ${employee.last_name}`, value: employee.id }));
        managerChoices.unshift({ name: 'None', value: null });
        // Prompt the user to enter the new employee's first name, last name, role, and manager
        const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: 'Enter the employee\'s first name:',
            },
            {
                type: 'input',
                name: 'last_name',
                message: 'Enter the employee\'s last name:',
            },
            {
                type: 'list',
                name: 'role_id',
                message: 'Select the employee\'s role:',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'manager_id',
                message: 'Select the employee\'s manager:',
                choices: managerChoices,
            },
        ]);
        // Insert the new employee into the employee table
        await db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [
            first_name,
            last_name,
            role_id,
            manager_id,
        ]);
        console.log('Employee added successfully!');
        // Fetch and display the updated employee table
        console.log('\n Viewing updated employee table:');
        const [rows] = await db.query(`
      SELECT
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Role',
        IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'None') AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `);
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error in add employee:', err);
    }
}
// Add a department function
const addDepartment = async () => {
    try {
        console.log('Adding department...\n');
        // Prompt the user to enter the new department name
        const { name } = await inquirer.prompt({
            type: 'input',
            name: 'name',
            message: 'Enter the department name:'
        });
        // Insert the new department into the department table
        await db.query('INSERT INTO department (name) VALUES (?)', [name]);
        console.log('Department added successfully!');
        // View the updated table after adding the new department
        console.log('\nViewing updated departments table:');
        const [rows] = await db.query('SELECT * FROM department');
        console.table(rows);
        mainMenu();
    } catch (err) {
        console.error('Error adding department:', err);
    }
}
// Add a role function
const addRole = async () => {
    try {
        console.log('Adding role...\n');
        const [departments] = await db.query('SELECT * FROM department');
        // Create array of department choices for the user to select from
        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id
        }));
        // Prompt the user to enter the new role's title, salary, and department
        const { title, salary, department_id } = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the role title:'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the role salary:'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Select the department for the role:',
                choices: departmentChoices
            }
        ]);
        // Insert the new role into the roles table
        await db.query('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [
            title,
            salary,
            department_id
        ]);
        console.log('Role added successfully!');
        // View the updated roles table after adding the new role
        console.log('\nViewing updated roles table:');
        const [roles] = await db.query(`
      SELECT r.id AS 'Role ID', r.title AS 'Role Title', d.name AS 'Department', r.salary AS 'Salary'
      FROM roles r
      LEFT JOIN department d ON r.department_id = d.id;
    `);
        console.table(roles);
        mainMenu();
    } catch (err) {
        console.error('Error in add role:', err);
    }
}
// Update employee role function
const updateEmployeeRole = async () => {
    try {
        console.log('Updating employee role...\n');
        const [employees] = await db.query('SELECT * FROM employee');
        const [roles] = await db.query('SELECT * FROM roles');
        // connecting the employee to the role
        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
        // connecting the role to the employee
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));
        // Prompting the user to select an employee and a new role
        const { employeeId, newRoleId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update:',
                choices: employeeChoices
            },
            {
                type: 'list',
                name: 'newRoleId',
                message: 'Select the employee\'s new role:',
                choices: roleChoices
            }
        ]);
        // Updating the employee role
        await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [
            newRoleId,
            employeeId
        ]);
        console.log('Employee role updated successfully!');
        // Viewing updated employee table after updating the role
        console.log('\nViewing updated employee table:');
        const [updatedEmployees] = await db.query(`
      SELECT
        e.id AS 'Employee ID',
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Role',
        d.name AS 'Department',
        r.salary AS 'Salary',
        IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'None') AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `);
        console.table(updatedEmployees);
        mainMenu();
    } catch (err) {
        console.error('Error in update employee role:', err);
    }
}
// Update employee manager function
const updateEmployeeManager = async () => {
    try {
        console.log('Updating employee manager...\n');
        // Fetch all employees and their current managers from the database
        const [employees] = await db.query(`
      SELECT
        e.id AS 'Employee ID',
        CONCAT(e.first_name, ' ', e.last_name) AS 'Employee Name',
        IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'None') AS 'Current Manager'
      FROM
        employee e
        LEFT JOIN employee m ON e.manager_id = m.id;
    `);
        // Prompt the user to select the employee to update
        const employeeChoices = employees.map(employee => ({
            name: `${employee['Employee Name']} (Current Manager: ${employee['Current Manager']})`,
            value: employee['Employee ID']
        }));
        const { employeeId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to update their manager:',
                choices: employeeChoices
            }
        ]);
        // Fetch all employees to use as manager choices
        const [managers] = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
        const managerChoices = managers.map(manager => ({
            name: manager.name,
            value: manager.id
        }));
        // Add a 'None' option to the manager choices
        managerChoices.unshift({ name: 'None', value: null });
        // Prompt the user to select the new manager
        const { newManagerId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'newManagerId',
                message: 'Select the employee\'s new manager:',
                choices: managerChoices
            }
        ]);
        // Update the employee's manager in the database
        await db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [newManagerId, employeeId]);
        console.log('Employee manager updated successfully!');
        // Fetch and display the updated employee table
        console.log('\nViewing updated employee table:');
        const [updatedEmployees] = await db.query(`
      SELECT
        e.id AS 'Employee ID',
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Role',
        d.name AS 'Department',
        r.salary AS 'Salary',
        IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'None') AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `);
    // Display the updated employee table
        console.table(updatedEmployees);
        mainMenu();
    } catch (err) {
        console.error('Error in update employee manager:', err);
    }
}
// Delete Department
const deleteDepartment = async () => {
    try {
        console.log('Deleting department...\n');
        // Fetch all departments from the database
        const [departments] = await db.query('SELECT * FROM department');
        // Prompt the user to select the department to delete
        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id
        }));
        const { departmentId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department to delete:',
                choices: departmentChoices
            }
        ]);
        // Fetch the roles associated with the selected department, including the department name
        const [associatedRoles] = await db.query(`
      SELECT r.id, r.title, r.salary, d.name AS department_name
      FROM roles r
      JOIN department d ON r.department_id = d.id
      WHERE r.department_id = ?
    `, [departmentId]);
        // If the department has associated roles, prompt the user to confirm the deletion
        if (associatedRoles.length > 0) {
            console.log('Warning: This department has associated roles:');
            console.table(associatedRoles); // Display the associated roles with department name
            const { confirmDelete } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: 'Deleting this department will also delete the associated roles. Do you want to continue?',
                    default: false
                }
            ]);
            // If the user cancels the deletion, return to the main menu
            if (!confirmDelete) {
                console.log('Department deletion canceled.');
                mainMenu();
                return;
            }
        }
        // Delete the associated roles
        for (const role of associatedRoles) {
            await db.query('DELETE FROM roles WHERE id = ?', [role.id]);
        }
        // Delete the selected department from the database
        await db.query('DELETE FROM department WHERE id = ?', [departmentId]);
        console.log('Department deleted successfully!');
        // Fetch and display the updated department table
        console.log('\nViewing updated department table:');
        const [updatedDepartments] = await db.query('SELECT * FROM department');
        console.table(updatedDepartments);
        // Return to the main menu
        mainMenu();
    } catch (err) {
        console.error('Error in delete department:', err);
    }
};
// Delete Role
const deleteRole = async () => {
    try {
        console.log('Deleting role...\n');
        // Fetch all roles from the database
        const [roles] = await db.query('SELECT * FROM roles');
        // Prompt the user to select the role to delete
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));
        const { roleId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the role to delete:',
                choices: roleChoices
            }
        ]);
        // Delete the selected role from the database
        await db.query('DELETE FROM roles WHERE id = ?', [roleId]);
        console.log('Role deleted successfully!');
        // Fetch and display the updated roles table
        console.log('\nViewing updated roles table:');
        const [updatedRoles] = await db.query('SELECT * FROM roles');
        console.table(updatedRoles);
        mainMenu();
    } catch (err) {
        console.error('Error in delete role:', err);
    }
};
// Delete Employee
const deleteEmployee = async () => {
    try {
        console.log('Deleting employee...\n');
        // Fetch all employees from the database
        const [employees] = await db.query('SELECT * FROM employee');
        // Prompt the user to select the employee to delete
        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));
        const { employeeId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee to delete:',
                choices: employeeChoices
            }
        ]);
        // Delete the selected employee from the database
        await db.query('DELETE FROM employee WHERE id = ?', [employeeId]);
        console.log('Employee deleted successfully!');
        // Fetch and display the updated employee table
        console.log('\nViewing updated employee table:');
        const [updatedEmployees] = await db.query(`
      SELECT
        e.id AS 'Employee ID',
        e.first_name AS 'First Name',
        e.last_name AS 'Last Name',
        r.title AS 'Role',
        d.name AS 'Department',
        r.salary AS 'Salary',
        IFNULL(CONCAT(m.first_name, ' ', m.last_name), 'None') AS 'Manager'
      FROM
        employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;
    `);
        console.table(updatedEmployees);
        mainMenu();
    } catch (err) {
        console.error('Error in delete employee:', err);
    }
};

connectToDatabase();

