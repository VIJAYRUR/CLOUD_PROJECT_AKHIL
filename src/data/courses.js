// Mock course data
const courses = [
  {
    id: 1,
    title: 'Cloud Computing Fundamentals',
    description: 'Master the core concepts of cloud computing and learn how to leverage cloud services for scalable, reliable applications.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    level: 'Beginner',
    duration: '4 weeks',
    instructor: 'Dr. Sarah Chen',
    rating: 4.8,
    enrolledStudents: 1245,
    sections: {
      introduction: {
        title: 'Introduction to Cloud Computing',
        content: `Cloud computing is the on-demand delivery of IT resources over the Internet with pay-as-you-go pricing. Instead of buying, owning, and maintaining physical data centers and servers, you can access technology services, such as computing power, storage, and databases, on an as-needed basis from a cloud provider.

Organizations of every type, size, and industry are using the cloud for a wide variety of use cases, such as data backup, disaster recovery, email, virtual desktops, software development and testing, big data analytics, and customer-facing web applications. For example, healthcare companies are using the cloud to develop more personalized treatments for patients. Financial services companies are using the cloud to power real-time fraud detection and prevention. And video game makers are using the cloud to deliver online games to millions of players around the world.`,
        resources: [
          { type: 'video', url: 'https://www.youtube.com/watch?v=M988_fsOSWo', title: 'Cloud Computing Explained' },
          { type: 'article', url: 'https://aws.amazon.com/what-is-cloud-computing/', title: 'What is Cloud Computing?' },
          { type: 'pdf', url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html', title: 'AWS Cloud Overview' }
        ]
      },
      quiz: {
        title: 'Cloud Computing Basics Quiz',
        questions: [
          {
            id: 1,
            question: 'What is the primary benefit of the pay-as-you-go pricing model in cloud computing?',
            options: [
              'It allows companies to convert capital expenses to operational expenses',
              'It provides unlimited storage for free',
              'It guarantees 100% uptime',
              'It eliminates the need for security measures'
            ],
            correctAnswer: 0,
            explanation: 'The pay-as-you-go pricing model allows companies to convert capital expenses (like building data centers) to operational expenses, paying only for the resources they use when they use them.'
          },
          {
            id: 2,
            question: 'Which of the following is NOT one of the main cloud service models?',
            options: [
              'Infrastructure as a Service (IaaS)',
              'Platform as a Service (PaaS)',
              'Software as a Service (SaaS)',
              'Hardware as a Service (HaaS)'
            ],
            correctAnswer: 3,
            explanation: 'The three main cloud service models are Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS). Hardware as a Service is not a standard cloud service model.'
          },
          {
            id: 3,
            question: 'What is a key characteristic of cloud computing?',
            options: [
              'It requires specialized hardware',
              'It always costs more than on-premises solutions',
              'It provides on-demand self-service',
              'It reduces internet dependency'
            ],
            correctAnswer: 2,
            explanation: 'On-demand self-service is a key characteristic of cloud computing, allowing users to provision resources as needed without requiring human interaction with service providers.'
          },
          {
            id: 4,
            question: 'Which cloud deployment model provides the highest level of control over resources?',
            options: [
              'Public Cloud',
              'Private Cloud',
              'Hybrid Cloud',
              'Community Cloud'
            ],
            correctAnswer: 1,
            explanation: 'Private Cloud provides the highest level of control over resources as it is dedicated to a single organization and can be hosted either on-premises or by a third-party provider.'
          },
          {
            id: 5,
            question: 'What is the concept of "elasticity" in cloud computing?',
            options: [
              'The ability to stretch physical servers',
              'The ability to quickly scale resources up or down based on demand',
              'The flexibility of payment options',
              'The ability to move data between different cloud providers'
            ],
            correctAnswer: 1,
            explanation: 'Elasticity in cloud computing refers to the ability to quickly scale resources up or down based on demand, allowing applications to automatically adapt to workload changes.'
          }
        ]
      },
      advanced: {
        title: 'Advanced Cloud Computing Concepts',
        content: `This section explores advanced cloud computing concepts that are essential for designing robust, scalable, and cost-effective cloud solutions.

Cloud architecture best practices focus on building systems that are reliable, secure, efficient, and cost-effective. Key principles include designing for failure (assuming components will fail and planning accordingly), implementing loose coupling (minimizing dependencies between components), and optimizing for cost through right-sizing resources and implementing auto-scaling.

Containerization and orchestration have revolutionized application deployment in the cloud. Containers package application code with dependencies, ensuring consistent operation across environments. Kubernetes has emerged as the leading container orchestration platform, automating deployment, scaling, and management of containerized applications.

Serverless computing represents a paradigm shift where developers focus solely on writing code without managing servers. Functions as a Service (FaaS) platforms like AWS Lambda execute code in response to events, automatically scaling as needed and charging only for compute time consumed.

Multi-cloud and hybrid cloud strategies help organizations avoid vendor lock-in, optimize costs, and leverage the best services from different providers. These approaches require careful planning for data integration, networking, security, and governance.`,
        resources: [
          { type: 'video', url: 'https://www.youtube.com/watch?v=p9FKRatltCU', title: 'Containerization Explained' },
          { type: 'article', url: 'https://aws.amazon.com/serverless/', title: 'Serverless Computing Architecture' },
          { type: 'tutorial', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', title: 'Kubernetes Basics' }
        ]
      },
      advancedQuiz: {
        title: 'Advanced Cloud Computing Quiz',
        questions: [
          {
            id: 1,
            question: 'Which of the following is a key benefit of containerization?',
            options: [
              'Eliminates the need for operating systems',
              'Provides consistent environments across development, testing, and production',
              'Automatically scales databases',
              'Reduces the need for application code'
            ],
            correctAnswer: 1,
            explanation: 'Containerization packages application code with dependencies, ensuring consistent operation across different environments (development, testing, and production).'
          },
          {
            id: 2,
            question: 'What is a key characteristic of serverless computing?',
            options: [
              'It requires no code',
              'It eliminates all operational costs',
              'It automatically scales based on demand',
              'It only works with specific programming languages'
            ],
            correctAnswer: 2,
            explanation: 'A key characteristic of serverless computing is automatic scaling based on demand, where the platform handles all the scaling needs without developer intervention.'
          },
          {
            id: 3,
            question: 'In the context of cloud architecture, what does "designing for failure" mean?',
            options: [
              'Creating systems that are intended to fail',
              'Assuming components will fail and designing systems to be resilient',
              'Avoiding redundancy to reduce costs',
              'Testing only failure scenarios'
            ],
            correctAnswer: 1,
            explanation: 'Designing for failure means assuming that components will fail and designing systems to be resilient through redundancy, fault isolation, and automated recovery.'
          },
          {
            id: 4,
            question: 'What is the primary purpose of Kubernetes?',
            options: [
              'To create container images',
              'To provide cloud storage solutions',
              'To orchestrate containerized applications',
              'To replace virtual machines'
            ],
            correctAnswer: 2,
            explanation: 'Kubernetes is a container orchestration platform that automates the deployment, scaling, and management of containerized applications.'
          },
          {
            id: 5,
            question: 'What is a key consideration when implementing a multi-cloud strategy?',
            options: [
              'Using only one programming language',
              'Centralizing all data in one cloud provider',
              'Ensuring compatibility and integration between different cloud services',
              'Avoiding the use of containers'
            ],
            correctAnswer: 2,
            explanation: 'When implementing a multi-cloud strategy, ensuring compatibility and integration between different cloud services is crucial for seamless operation across providers.'
          }
        ]
      },
      homework: {
        title: 'Cloud Architecture Design Project',
        description: 'Design a scalable, fault-tolerant cloud architecture for an e-commerce application that experiences variable traffic patterns with significant spikes during promotional events.',
        tasks: [
          'Create a detailed architecture diagram showing all components and their interactions',
          'Specify which cloud services you would use and justify your choices',
          'Design for high availability with a recovery point objective (RPO) of 15 minutes and recovery time objective (RTO) of 30 minutes',
          'Implement auto-scaling strategies for handling variable load',
          'Describe your data storage strategy, including considerations for performance, durability, and cost',
          'Outline security measures to protect customer data and prevent common attacks'
        ],
        dueDate: '2023-05-20',
        submissionFormat: 'PDF document (5-10 pages) including diagrams and explanations'
      }
    }
  },
  {
    id: 2,
    title: 'AWS Solutions Architect',
    description: 'Learn to design and deploy scalable, highly available, and fault-tolerant systems on AWS.',
    image: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    level: 'Intermediate',
    duration: '6 weeks',
    instructor: 'James Wilson',
    rating: 4.9,
    enrolledStudents: 3210,
    sections: {
      introduction: {
        title: 'Introduction to AWS Architecture',
        content: `Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally. Millions of customers—including the fastest-growing startups, largest enterprises, and leading government agencies—are using AWS to lower costs, become more agile, and innovate faster.

As an AWS Solutions Architect, you'll need to understand how to design, deploy, and manage applications on the AWS platform. This course will teach you the fundamental AWS services, architectural best practices, and strategies for building secure, reliable, and cost-effective cloud solutions.

The AWS Well-Architected Framework helps cloud architects build secure, high-performing, resilient, and efficient infrastructure for their applications. It's based on five pillars:
1. Operational Excellence
2. Security
3. Reliability
4. Performance Efficiency
5. Cost Optimization

Throughout this course, we'll explore these pillars and how to apply them to your AWS architecture designs.`,
        resources: [
          { type: 'video', url: 'https://www.youtube.com/watch?v=JIbIYCM48to', title: 'AWS Certified Solutions Architect - Overview' },
          { type: 'article', url: 'https://aws.amazon.com/architecture/well-architected/', title: 'AWS Well-Architected Framework' },
          { type: 'documentation', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html', title: 'AWS Well-Architected Framework Documentation' }
        ]
      },
      quiz: {
        title: 'AWS Fundamentals Quiz',
        questions: [
          {
            id: 1,
            question: 'Which AWS service would you use to run containers without managing servers or clusters?',
            options: [
              'Amazon EC2',
              'AWS Lambda',
              'Amazon ECS',
              'AWS Fargate'
            ],
            correctAnswer: 3,
            explanation: 'AWS Fargate is a serverless compute engine for containers that works with both Amazon ECS and Amazon EKS. It allows you to run containers without having to manage servers or clusters.'
          },
          {
            id: 2,
            question: 'Which AWS service provides a virtual network dedicated to your AWS account?',
            options: [
              'Amazon VPC',
              'Amazon Route 53',
              'AWS Direct Connect',
              'Amazon CloudFront'
            ],
            correctAnswer: 0,
            explanation: 'Amazon Virtual Private Cloud (VPC) provides a virtual network dedicated to your AWS account, isolated from other virtual networks in the AWS Cloud.'
          },
          {
            id: 3,
            question: 'Which AWS service would you use for storing objects like images, videos, and documents?',
            options: [
              'Amazon EBS',
              'Amazon S3',
              'Amazon RDS',
              'Amazon EFS'
            ],
            correctAnswer: 1,
            explanation: 'Amazon Simple Storage Service (S3) is an object storage service offering industry-leading scalability, data availability, security, and performance for storing objects like images, videos, and documents.'
          },
          {
            id: 4,
            question: 'Which AWS service automatically distributes incoming application traffic across multiple targets?',
            options: [
              'Amazon Route 53',
              'AWS Global Accelerator',
              'Amazon CloudFront',
              'Elastic Load Balancing'
            ],
            correctAnswer: 3,
            explanation: 'Elastic Load Balancing (ELB) automatically distributes incoming application traffic across multiple targets, such as EC2 instances, containers, and IP addresses, in one or more Availability Zones.'
          },
          {
            id: 5,
            question: 'Which pillar of the AWS Well-Architected Framework focuses on the ability to efficiently use computing resources to meet requirements?',
            options: [
              'Operational Excellence',
              'Security',
              'Reliability',
              'Performance Efficiency'
            ],
            correctAnswer: 3,
            explanation: 'The Performance Efficiency pillar focuses on the efficient use of computing resources to meet requirements and how to maintain that efficiency as demand changes and technologies evolve.'
          }
        ]
      },
      advanced: {
        title: 'Advanced AWS Architecture',
        content: `This section covers advanced AWS architecture concepts and services that are essential for designing complex, enterprise-grade solutions.

Microservices architecture on AWS leverages services like Amazon ECS, EKS, and App Mesh to build applications composed of loosely coupled, independently deployable services. This approach improves scalability, resilience, and development agility.

Serverless architectures on AWS combine services like Lambda, API Gateway, DynamoDB, and S3 to build applications without managing servers. This reduces operational complexity and allows for automatic scaling and pay-for-use pricing.

Data lakes on AWS use services like S3, Athena, Glue, and Lake Formation to store, catalog, and analyze structured and unstructured data at any scale. This enables organizations to break down data silos and derive insights from all their data.

Multi-region architectures leverage AWS's global infrastructure to build applications that are resilient to regional outages and provide low-latency access to users worldwide. Services like Route 53, CloudFront, Global Accelerator, and S3 Cross-Region Replication are key components.

Security in AWS is implemented through multiple layers, including network security (VPCs, security groups, NACLs), identity and access management (IAM, Organizations), data protection (KMS, CloudHSM), and continuous monitoring (CloudTrail, GuardDuty, Security Hub).`,
        resources: [
          { type: 'whitepaper', url: 'https://d1.awsstatic.com/whitepapers/microservices-on-aws.pdf', title: 'Microservices on AWS' },
          { type: 'article', url: 'https://aws.amazon.com/blogs/architecture/ten-things-serverless-architects-should-know/', title: 'Ten Things Serverless Architects Should Know' },
          { type: 'video', url: 'https://www.youtube.com/watch?v=jKPlGznbfZ0', title: 'Building Multi-Region Architectures' }
        ]
      },
      advancedQuiz: {
        title: 'Advanced AWS Architecture Quiz',
        questions: [
          {
            id: 1,
            question: 'Which AWS service would you use to implement a serverless API?',
            options: [
              'Amazon EC2 with Elastic Load Balancing',
              'Amazon API Gateway with AWS Lambda',
              'Amazon ECS with Fargate',
              'Amazon AppSync with DynamoDB'
            ],
            correctAnswer: 1,
            explanation: 'Amazon API Gateway integrated with AWS Lambda is the primary way to implement a serverless API on AWS, allowing you to build REST and WebSocket APIs without managing servers.'
          },
          {
            id: 2,
            question: 'Which AWS service provides a fully managed message queuing service for microservices, distributed systems, and serverless applications?',
            options: [
              'Amazon SNS',
              'Amazon SQS',
              'Amazon MQ',
              'AWS Step Functions'
            ],
            correctAnswer: 1,
            explanation: 'Amazon Simple Queue Service (SQS) is a fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications.'
          },
          {
            id: 3,
            question: 'In a multi-region architecture, which AWS service would you use to route traffic to the region with the lowest latency?',
            options: [
              'Elastic Load Balancing',
              'Amazon CloudFront',
              'Amazon Route 53 with latency-based routing',
              'AWS Global Accelerator'
            ],
            correctAnswer: 2,
            explanation: 'Amazon Route 53 with latency-based routing automatically routes traffic to the AWS region with the lowest latency for the end user.'
          },
          {
            id: 4,
            question: 'Which AWS service would you use to implement a data lake solution?',
            options: [
              'Amazon RDS',
              'Amazon Redshift',
              'Amazon S3 with AWS Glue',
              'Amazon DynamoDB'
            ],
            correctAnswer: 2,
            explanation: 'Amazon S3 combined with AWS Glue is commonly used to implement data lake solutions, with S3 providing durable, scalable storage and Glue offering data catalog and ETL capabilities.'
          },
          {
            id: 5,
            question: 'Which AWS service provides a way to centrally manage policies across multiple AWS accounts?',
            options: [
              'AWS IAM',
              'AWS Organizations',
              'AWS Control Tower',
              'AWS Security Hub'
            ],
            correctAnswer: 1,
            explanation: 'AWS Organizations allows you to centrally manage and govern your environment as you grow and scale your AWS resources, including centralized policy management across multiple AWS accounts.'
          }
        ]
      },
      homework: {
        title: 'Multi-Region Serverless Architecture Design',
        description: 'Design a serverless, multi-region architecture for a global content delivery platform that requires low latency, high availability, and compliance with regional data sovereignty requirements.',
        tasks: [
          'Create a detailed architecture diagram showing all components across multiple regions',
          'Design the data replication strategy between regions',
          'Implement a global traffic routing strategy that optimizes for latency and availability',
          'Design the authentication and authorization system that works across regions',
          'Develop a deployment strategy that ensures consistent updates across all regions',
          'Create a disaster recovery plan with defined RPO and RTO metrics',
          'Address data sovereignty requirements through appropriate data storage and processing strategies'
        ],
        dueDate: '2023-06-10',
        submissionFormat: 'Architecture diagram (PDF) and written explanation (1500-2000 words)'
      }
    }
  },
  {
    id: 3,
    title: 'DevOps on AWS',
    description: 'Master DevOps practices and tools on AWS to automate software delivery and infrastructure management.',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    level: 'Advanced',
    duration: '8 weeks',
    instructor: 'Maria Rodriguez',
    rating: 4.7,
    enrolledStudents: 1876,
    sections: {
      introduction: {
        title: 'Introduction to DevOps on AWS',
        content: `DevOps is the combination of cultural philosophies, practices, and tools that increases an organization's ability to deliver applications and services at high velocity. AWS provides a set of flexible services designed to enable companies to more rapidly and reliably build and deliver products using AWS and DevOps practices.

The DevOps model emphasizes collaboration between development and operations teams, automation of processes, and continuous integration and delivery. By adopting DevOps practices on AWS, organizations can achieve:

- Faster time to market
- Improved quality and reliability
- Increased operational efficiency
- Better scalability
- Enhanced security and compliance

This course will teach you how to implement DevOps practices using AWS services such as CodeCommit, CodeBuild, CodeDeploy, CodePipeline, CloudFormation, and more. You'll learn how to automate infrastructure provisioning, build and test processes, deployment strategies, and monitoring solutions.`,
        resources: [
          { type: 'video', url: 'https://www.youtube.com/watch?v=esEFaY0FDKc', title: 'Introduction to DevOps on AWS' },
          { type: 'whitepaper', url: 'https://docs.aws.amazon.com/whitepapers/latest/practicing-continuous-integration-continuous-delivery/practicing-continuous-integration-continuous-delivery.pdf', title: 'Practicing CI/CD on AWS' },
          { type: 'documentation', url: 'https://aws.amazon.com/devops/', title: 'AWS DevOps Overview' }
        ]
      },
      quiz: {
        title: 'DevOps Fundamentals Quiz',
        questions: [
          {
            id: 1,
            question: 'Which AWS service provides a fully managed source control service that hosts Git repositories?',
            options: [
              'AWS CodeBuild',
              'AWS CodeCommit',
              'AWS CodeDeploy',
              'AWS CodePipeline'
            ],
            correctAnswer: 1,
            explanation: 'AWS CodeCommit is a fully managed source control service that hosts secure Git-based repositories, eliminating the need to operate your own source control system.'
          },
          {
            id: 2,
            question: 'What is the primary purpose of Infrastructure as Code (IaC)?',
            options: [
              'To eliminate the need for developers',
              'To automate the provisioning and management of infrastructure using code',
              'To replace cloud computing with on-premises solutions',
              'To reduce the cost of hardware'
            ],
            correctAnswer: 1,
            explanation: 'Infrastructure as Code (IaC) is the practice of automating the provisioning and management of infrastructure using code, which improves consistency, reduces errors, and enables version control of infrastructure configurations.'
          },
          {
            id: 3,
            question: 'Which AWS service would you use to create a continuous integration and continuous delivery (CI/CD) pipeline?',
            options: [
              'AWS Elastic Beanstalk',
              'AWS CloudFormation',
              'AWS CodePipeline',
              'AWS OpsWorks'
            ],
            correctAnswer: 2,
            explanation: 'AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates.'
          },
          {
            id: 4,
            question: 'What is a key benefit of implementing automated testing in a CI/CD pipeline?',
            options: [
              'It eliminates the need for manual testing completely',
              'It reduces the time needed to write code',
              'It catches issues early in the development process',
              'It guarantees bug-free code'
            ],
            correctAnswer: 2,
            explanation: 'A key benefit of automated testing in CI/CD pipelines is that it catches issues early in the development process, reducing the cost and time required to fix them compared to finding them later in production.'
          },
          {
            id: 5,
            question: 'Which deployment strategy involves releasing a new version to a small subset of users before rolling it out to the entire user base?',
            options: [
              'Blue/Green deployment',
              'Canary deployment',
              'All-at-once deployment',
              'Rolling deployment'
            ],
            correctAnswer: 1,
            explanation: 'Canary deployment involves releasing a new version to a small subset of users or servers before rolling it out to the entire infrastructure, allowing you to test the new version with minimal risk.'
          }
        ]
      },
      advanced: {
        title: 'Advanced DevOps Practices on AWS',
        content: `This section covers advanced DevOps practices and how to implement them using AWS services.

Infrastructure as Code (IaC) is a fundamental DevOps practice that involves managing infrastructure through code rather than manual processes. AWS CloudFormation and the AWS Cloud Development Kit (CDK) enable you to define your infrastructure using declarative templates or familiar programming languages. This approach ensures consistency, enables version control, and facilitates automated testing of infrastructure changes.

Continuous Integration and Continuous Delivery (CI/CD) automates the building, testing, and deployment of applications. AWS provides a comprehensive set of services for implementing CI/CD pipelines, including CodeCommit for source control, CodeBuild for building and testing, CodeDeploy for deployment, and CodePipeline for orchestrating the entire process. These services integrate seamlessly with each other and with third-party tools.

Microservices architectures break applications into small, independent services that can be developed, deployed, and scaled independently. AWS provides several options for running microservices, including Amazon ECS, EKS, and App Runner. These services simplify container management and enable automated deployment of microservices.

Monitoring and observability are critical for maintaining the health and performance of applications. AWS CloudWatch, X-Ray, and Container Insights provide comprehensive monitoring capabilities, including metrics, logs, traces, and alarms. These services help you detect and diagnose issues quickly, ensuring high availability and performance.

Security automation integrates security practices into the DevOps workflow. AWS provides services like IAM for access control, Security Hub for security posture management, and GuardDuty for threat detection. By automating security checks and compliance validation in your CI/CD pipeline, you can ensure that security is built into your applications from the start.`,
        resources: [
          { type: 'tutorial', url: 'https://aws.amazon.com/getting-started/hands-on/create-a-pipeline-using-codecommit-and-codepipeline/', title: 'Creating a CI/CD Pipeline on AWS' },
          { type: 'video', url: 'https://www.youtube.com/watch?v=01ewawuL-IY', title: 'Infrastructure as Code with AWS CDK' },
          { type: 'documentation', url: 'https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html', title: 'Running Microservices on Amazon ECS' }
        ]
      },
      advancedQuiz: {
        title: 'Advanced DevOps on AWS Quiz',
        questions: [
          {
            id: 1,
            question: 'Which AWS service allows you to define infrastructure using programming languages like TypeScript, Python, and Java?',
            options: [
              'AWS CloudFormation',
              'AWS Cloud Development Kit (CDK)',
              'AWS Elastic Beanstalk',
              'AWS OpsWorks'
            ],
            correctAnswer: 1,
            explanation: 'The AWS Cloud Development Kit (CDK) is an open-source software development framework that allows you to define cloud infrastructure using familiar programming languages like TypeScript, Python, Java, and .NET.'
          },
          {
            id: 2,
            question: 'What is a key advantage of using a blue/green deployment strategy?',
            options: [
              'It requires less infrastructure',
              'It allows for immediate rollback if issues are detected',
              'It is always faster than other deployment strategies',
              'It eliminates the need for testing'
            ],
            correctAnswer: 1,
            explanation: 'A key advantage of blue/green deployment is that it allows for immediate rollback if issues are detected with the new version (green), as the old version (blue) remains available and can be switched back to quickly.'
          },
          {
            id: 3,
            question: 'Which AWS service would you use to automatically detect and remediate compliance violations in your AWS resources?',
            options: [
              'AWS Config',
              'AWS Inspector',
              'AWS Trusted Advisor',
              'AWS GuardDuty'
            ],
            correctAnswer: 0,
            explanation: 'AWS Config continuously monitors and records your AWS resource configurations, allowing you to automate the evaluation of recorded configurations against desired configurations and automatically remediate non-compliant resources.'
          },
          {
            id: 4,
            question: 'What is the purpose of chaos engineering in a DevOps environment?',
            options: [
              'To create confusion among team members',
              'To deliberately introduce failures to test system resilience',
              'To eliminate all potential points of failure',
              'To reduce the complexity of systems'
            ],
            correctAnswer: 1,
            explanation: 'Chaos engineering involves deliberately introducing failures or adverse conditions in a controlled environment to test the system\'s resilience and identify weaknesses before they cause real outages.'
          },
          {
            id: 5,
            question: 'Which AWS service provides distributed tracing to help you analyze and debug microservices applications?',
            options: [
              'AWS CloudWatch',
              'AWS CloudTrail',
              'AWS X-Ray',
              'AWS AppSync'
            ],
            correctAnswer: 2,
            explanation: 'AWS X-Ray provides distributed tracing capabilities that help you analyze and debug distributed applications, such as those built using a microservices architecture, by tracking requests as they travel through your application.'
          }
        ]
      },
      homework: {
        title: 'CI/CD Pipeline for Microservices',
        description: 'Design and implement a comprehensive CI/CD pipeline for a microservices-based application on AWS, incorporating infrastructure as code, automated testing, and security validation.',
        tasks: [
          'Set up a version control repository using AWS CodeCommit or GitHub',
          'Create infrastructure as code templates using AWS CloudFormation or AWS CDK',
          'Implement a CI/CD pipeline using AWS CodePipeline that includes:',
          '- Source stage (CodeCommit/GitHub)',
          '- Build and test stage (CodeBuild)',
          '- Security scanning stage (integrate with tools like SonarQube, OWASP Dependency Check)',
          '- Deployment stage using a blue/green strategy (CodeDeploy)',
          'Implement automated testing (unit tests, integration tests, end-to-end tests)',
          'Set up monitoring and alerting for the pipeline and deployed application',
          'Document the pipeline architecture, security considerations, and operational procedures'
        ],
        dueDate: '2023-07-01',
        submissionFormat: 'GitHub repository with code, CloudFormation/CDK templates, and documentation'
      }
    }
  }
];

export default courses;
