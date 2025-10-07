provider "aws" {
  region = var.region
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

}

resource "aws_key_pair" "deployer_key" {
  key_name   = "us-east-1-dev-lms-key-new" # Name of the key pair in AWS
  public_key = file(".ssh/id_rsa_terraform_new.pub") # Path to your local public SSH key
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

}

# Public and Private Subnets
resource "aws_subnet" "private_zone1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.0.0/19"
  availability_zone = "us-east-1a"

}

resource "aws_subnet" "private_zone2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.32.0/19"
  availability_zone = "us-east-1b"
  
}

resource "aws_subnet" "public_zone1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.64.0/19"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "public_zone2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.96.0/19"
  availability_zone = "us-east-1b"

}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

}

# NAT Gateway
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_zone1.id

}

# Second NAT Gateway for redundancy
resource "aws_eip" "nat_zone2" {
  domain = "vpc"

}

resource "aws_nat_gateway" "nat_zone2" {
  allocation_id = aws_eip.nat_zone2.id
  subnet_id     = aws_subnet.public_zone2.id

}

# Route Tables and Associations
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

}

resource "aws_route_table_association" "private_zone1" {
  subnet_id      = aws_subnet.private_zone1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_zone2" {
  subnet_id      = aws_subnet.private_zone2.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "public_zone1" {
  subnet_id      = aws_subnet.public_zone1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_zone2" {
  subnet_id      = aws_subnet.public_zone2.id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "alb_sg" {
  name        = "alb-security-group"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Replace with specific IP ranges
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name        = "alb-security-group"

  }
}

resource "aws_security_group" "ec2_sg" {
  name        = "ec2-security-group"
  description = "Security group for EC2"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [ "0.0.0.0/0" ]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name        = "ec2-security-group"
  }
}





resource "aws_instance" "docker_host" {
  ami            = "ami-020cba7c55df1f615"
  instance_type = "t3.medium" # Adjust as needed
  
  subnet_id     = aws_subnet.public_zone1.id
  key_name      = aws_key_pair.deployer_key.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
      root_block_device {
      volume_size = 30
      volume_type = "gp3"
    }

  # User data to install Docker and Docker Compose (bootstrkafkaing)
  # This part is crucial and ensures Docker is ready when Terraform tries to connect
  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
              sudo apt-get update -y
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu # Change 'ubuntu' to 'ec2-user' if using Amazon Linux AMI
              newgrp docker # This will not take effect immediately for user_data, but good for interactive sessions
              EOF

  tags = {
    Name = "DockerMultiplekafkasHost"
  }

  # Connection details for all provisioners
  connection {
    type        = "ssh"
    user        = "ubuntu" # Or 'ec2-user' for Amazon Linux
    private_key = file(".ssh/id_rsa_terraform_new") # Path to your local private SSH key
    host        = self.public_ip
    
  }
associate_public_ip_address = true 
  # Provisioner to upload the first Docker Compose file
  # First: remote-exec to create directories
provisioner "remote-exec" {
  inline = [
    "sudo mkdir -p /home/ubuntu/kafka",
    "sudo mkdir -p /home/ubuntu/efk",
    "sudo chown -R ubuntu:ubuntu /home/ubuntu/kafka",
    "sudo chown -R ubuntu:ubuntu /home/ubuntu/efk",
    "sudo chmod 755 /home/ubuntu/kafka",
    "sudo chmod 755 /home/ubuntu/efk"
  ]
}

# Then upload files (after directories exist)
provisioner "file" {
  source      = "../backend/docker-compose-kafka.yaml"
  destination = "/home/ubuntu/kafka/docker-compose-kafka.yaml"
}

provisioner "file" {
  source      = "../backend/docker-compose.yaml"
  destination = "/home/ubuntu/efk/docker-compose.yaml"
}

provisioner "file" {
  source = "../backend/fluent-bit.conf"
  destination = "/home/ubuntu/efk/fluent-bit.conf"
}

provisioner "file" {
  source = "../backend/changeIP.sh"
  destination = "/home/ubuntu/kafka/changeIP.sh"
}
# Finally: run docker-compose
provisioner "remote-exec" {

  inline = [
    "sleep 60", # Give the instance some time to fully initialize networking

    # Execute the script to change the IP
    # The script itself handles the sudo and sed logic
    "sudo -i -u ubuntu bash -c 'cd /home/ubuntu/kafka && chmod +x changeIP.sh && ./changeIP.sh'",
    
    # Now, run docker compose for Kafka (using the modified file)
    "sudo -i -u ubuntu bash -c 'cd /home/ubuntu/kafka && docker compose -f docker-compose-kafka.yaml up -d'",

    # Your other docker compose and docker run commands follow
    "sudo -i -u ubuntu bash -c 'cd /home/ubuntu/efk && docker compose up -d'",
    "sudo -i -u ubuntu bash -c 'docker run -d -p 6379:6379 redis'",
    "sudo -i -u ubuntu bash -c 'docker run -d --name postgres-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres -p 5432:5432 postgres'",
  ]
}
}

output "public-ip" {
  value = aws_instance.docker_host.public_ip
}