-- DEPARTMENT SEEDS
INSERT INTO department (name) VALUES
    ('Sales'),
    ('Marketing'),
    ('Finance'),
    ('Human Resources');

-- ROLE SEEDS
INSERT INTO roles (job_title, salary, department_id) VALUES
    ('Sales Representative', 50000, 1),
    ('Sales Manager', 82000, 1),
    ('Account Executive', 67000, 1),
    ('Marketing Specialist', 55000, 2),
    ('Digital Content Specialist', 56000, 2),
    ('Media Relations Manager', 58000, 2),
    ('Financial Analyst', 60000, 3),
    ('Credit Analyst', 64000, 3),
    ('Accounting Director', 83000, 3),
    ('HR Manager', 87000, 4),
    ('HR Field Rep', 70000, 4),
    ('Recruiter', 61000, 4);

-- EMPLOYEE SEEDS
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('Olivia', 'Smith', 2, NULL), -- Sales Manager, no manager
    ('Melinda', 'Rae', 1, 1), -- Sales Representative reporting to Olivia
    ('Carlos', 'Perales', 1, 1), -- Sales Representative reporting to Olivia
    ('Gloria', 'Fuentes', 3, 1), -- Account Executive reporting to Olivia
    ('Rosa', 'Dean', 6, NULL), -- Media Relations Manager, no manager
    ('Emilia', 'Blunt', 4, 5), -- Marketing Specialist reporting to Rosa
    ('Kai', 'Lee', 5, 5), -- Digital Content Specialist reporting to Rosa
    ('Junsung', 'Park', 12, 10), -- Recruiter reporting to HR Manager
    ('Seonil', 'Jang', 11, 10), -- HR Field Rep reporting to HR Manager
    ('Lukas', 'Hoffmann', 9, NULL), -- Accounting Director, no manager
    ('Thea', 'Meyer', 7, 10), -- Financial Analyst reporting to Lukas
    ('Petra', 'Krause', 8, 10); -- Credit Analyst reporting to Lukas