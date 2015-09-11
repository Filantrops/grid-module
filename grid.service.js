Grid.factory('dataService', ['$http', function ($http) {
        var dataOp = {};
        dataOp.getScientificInstitutionById = function (id) {
            var institution = {}
            var req = {
                 method: 'GET',
                 url: 'http://localhost:3000/backend/data/institucija/' + id,
                 headers: {"Remote-host": "127.0.0.1", "Content-Type": 'application/json; charset=utf-8'}
            }
            return $http(req).
                then(function(response) {
                    // Map latvian variables to english variables
                    if (response.data) {
                        institution = 
                            {
                                    id: response.data.id,
                                    reg_nr: response.data.reg_nr,
                                    name: response.data.nosaukums,
                                    reg_date: response.data.reg_datums,
                                    owner_job: response.data.vaditaja_amats,
                                    owner_name: response.data.vaditaja_vards,
                                    owner_surname: response.data.vaditaja_uzvards,
                                    zi_phone: response.data.talruna_nr,
                                    email: response.data.epasts,
                                    adress: response.data.juridiska_adrese,

                                    status: response.data.juridiskais_statuss_id.toString(),
                                    zi_type: response.data.zi_tips_id.toString(),

                                    declared_owner: response.data.deklaretais_dibinatajs,
                                    document_date: response.data.reg_apliecibas_datums,
                                    //contact_name: item.juridiska_adrese,
                                    zi_fax: response.data.faksa_nr,
                                    homepage: response.data.majas_lapa,
                                    bank_name: response.data.bankas_nosaukums,
                                    bank_nr: response.data.bankas_konta_numurs,
                                    bank_pvn: response.data.vai_kontu_izmantot_pvn,
                                    services: response.data.pakalpojumi
                            }
                    }
                    return institution;
                }, function(response) {
                    return institution;
                });
        }

        dataOp.SaveScientificInstitutionById = function (institution) {
            var save_institution = 
                {
                        id: institution.id,
                        reg_nr: institution.reg_nr,
                        nosaukums: institution.name,
                        reg_datums: institution.reg_date,
                        vaditaja_amats: institution.owner_job,
                        vaditaja_vards: institution.owner_name,
                        vaditaja_uzvards: institution.owner_surname,
                        talruna_nr: institution.zi_phone,
                        epasts: institution.email,
                        juridiska_adrese: institution.adress,
                        juridiskais_statuss_id: parseInt(institution.status),
                        zi_tips_id: parseInt(institution.zi_type),
                        deklaretais_dibinatajs: institution.declared_owner,
                        reg_apliecibas_datums: institution.document_date,
                        //contact_name: item.juridiska_adrese,
                        faksa_nr: institution.zi_fax,
                        majas_lapa: institution.homepage,
                        bankas_nosaukums: institution.bank_name,
                        bankas_konta_numurs: institution.bank_nr,
                        vai_kontu_izmantot_pvn: institution.bank_pvn,
                        pakalpojumi:institution.services
                }
            var req = {
                 method: 'POST',
                 url: 'http://localhost:3000/backend/data/institucija',
                 data: save_institution,
                 headers: {"Remote-host": "127.0.0.1", "Content-Type": 'application/json; charset=utf-8'}
            }
            return $http(req).
                then(function(response) {
                    return response;
                }, function(response) {
                    return response;
                });
        }

        dataOp.getData = function (method) {
            // TODO when backend methods are ready
            // use method variable to determine what url to get
            // var urlBase = 'http://localhost:2307/Service1.svc';
            //return $http.get(urlBase+'/GetStudents');

            // Meanwhile return fake json
            var data = [];

            switch (method) {
                case "FP_FPK":
                    // for (var i = 1; i <= 100; i++) {
                    //     data.push(
                    //             {
                    //                 id: i,
                    //                 name: "name" + i,
                    //                 type: "type" + (i % 3 + 1),//for select (value 1-3)
                    //                 buyer: "pircējs" + i,
                    //                 project_nr: "12345" + i,
                                    
                    //                 under_program: "aktivitāte" + i,
                                    
                    //                 anotation: "anotācija" + i,
                    //                 term_from: "2015-01-01",
                    //                 term_to: "2015-02-01",
                                    
                    //                 stage_count: i,
                    //                 stage_nr: '1234' + i,
                    //                 stage_end_date:"2015-01-01",
                                    
                    //                 status: "status" + (i % 3 + 1),
                    //                 branch: "branch" + (i % 3 + 1),
                    //                 createdAt: "2015-01-1",
                    //                 total_finance_pvn: "1999" + i,
                    //                 owner: "person-" + i,
                                    
                    //                 worker_name: 'worker_name' + i,
                    //                 worker_surname: 'worker_surname' + i,
                    //                 worker_personal_code: '123456-12345',
                    //                 worker_si: 'institution' + i,
                    //                 worker_job: 'worker_job_title' + i,
                    //                 worker_date_from: "2013-01-01",
                    //                 worker_date_till: "2015-01-01",
                    //                 worker_ple: '213' + i,
                    //                 worker_is_retired:(i % 2) ? "yes" : "no",
                    //                 worker_salary: '1000' + i,
                    //                 worker_social_expenses: '2000' + i,
                    //                 worker_other_si: 'other_institution' + i,
                    //                 worker_si_name: 'si_name' + i,
                    //                 worker_si_reg_nr: '3242342343' + i,
                                    
                    //                 total_finanse_si: 'total_finanse_si' + i,
                    //                 total_finanse_year: 'total_finanse_year' + i,
                    //                 total_finanse_sum: '5423423' + i,
                    //                 total_finanse_remainder_begining: '777' + i,
                    //                 total_finanse_remainder_end: '444' + i,
                                    
                    //                 national_finanse_institution: "national_finanse_institution" + i,
                    //                 national_finanse_classifier: "national_finanse_classifier" + i,
                    //                 national_finanse_year: '1990' + i,
                    //                 national_finanse_sum: '5423423' + i,
                    //                 national_finanse_remainder_begining: '1000' + i,
                    //                 national_finanse_remainder_end: '2000' + i,
                                    
                    //                 private_finanse_institution: 'private_finanse_institution' + i,
                    //                 private_finanse_name: 'private_finanse_name' + i,
                    //                 private_finanse_reg_nr: '3242342343' + i,
                    //                 private_finanse_date: "2013-01-01",
                    //                 private_finanse_sum: '3000' + i
                    //             }
                    //     );
                    // }
                    // total = data.length;
                    break;
                case 'FP_ZKK':
                    // for (var i = 1; i <= 100; i++) {
                    //     data.push(
                    //             {
                    //                 id: i,
                    //                 name: "name"+i,
                    //                 surname: "surname"+i,
                    //                 worker_id: i,
                    //                 Oirc: "identificator"+i,
                    //                 job_type: "type" + (i % 3 + 1),//for select (value 1-3)
                    //                 job: "job"+i,
                    //                 institution: "institution"+i,
                    //                 job_from: "2010-02-15",
                    //                 job_till: "2010-03-16",
                    //                 lzp_from: "2010-04-17",
                    //                 lzp_till: "2010-05-18",
                                    
                    //                 phone: [{id : i, type : "type" + i, number : "21111111" + i}, {id : i + 1000, type : "type" + i, number : "31111111" + i}, {id : i + 2000, type : "type" + i, number : "41111111" + i}],
                    //                 email:"e@ma.il",
                    //                 academic_personal:(i % 2) ? "yes" : "no",
                    //                 voted_for_job:(i % 2) ? "yes" : "no",
                                    
                    //                 degrees: [
                    //                     {
                    //                         id : i, 
                    //                         degree_cvalification: "cvalification"+i,
                    //                         degree_branch: "branch"+i,
                    //                         degree_subBranch: "subBranch"+i, 
                    //                         degree_dateOn: "2010-01-14",
                    //                         degree_place: "university"+i,
                    //                         degree_nr: "1234567890"+i,
                    //                         degree_country: "country"+i
                    //                     },
                    //                     {
                    //                         id : i + 200, 
                    //                         degree_cvalification: "cvalification"+i,
                    //                         degree_branch: "branch"+i,
                    //                         degree_subBranch: "subBranch"+i, 
                    //                         degree_dateOn: "2010-01-14",
                    //                         degree_place: "university"+i,
                    //                         degree_nr: "1234567890"+i,
                    //                         degree_country: "country"+i
                    //                     },
                    //                     {
                    //                         id : i + 400, 
                    //                         degree_cvalification: "cvalification"+i,
                    //                         degree_branch: "branch"+i,
                    //                         degree_subBranch: "subBranch"+i, 
                    //                         degree_dateOn: "2010-01-14",
                    //                         degree_place: "university"+i,
                    //                         degree_nr: "1234567890"+i,
                    //                         degree_country: "country"+i
                    //                     }
                    //                 ],
                                    
                    //                 load_year: "2002",
                    //                 load_ple: "PLE"+i
                    //             }
                    //     );
                    // }
                    // total = data.length;
                    break;
                case 'FP_ZIK':
                    var req = {
                         method: 'GET',
                         url: 'http://localhost:3000/backend/data/institucija_list',
                         headers: {"Remote-host": "127.0.0.1", "Content-Type": 'application/json; charset=utf-8'}
                    }
                    return $http(req).
                        then(function(response) {
                            angular.forEach(response.data, function (item) {
                                data.push(
                                    {
                                        id: item.id,
                                        reg_nr: item.reg_nr,
                                        name: item.nosaukums,
                                        reg_date: item.reg_datums,
                                        owner_job: item.vaditaja_amats,
                                        owner_name: item.vaditajs,
                                        zi_phone: item.talruna_nr,
                                        email: item.epasts,
                                        adress: item.juridiska_adrese,
                                    }
                                );
                            });
                            return data;
                        }, function(response) {
                            return data;
                        });

                    break;
                case 'FP_APK':
//                     var academic_jobs_temp = [
//                             {
//                                 id: 1,
//                                 academic_job_name: "Ķīmijas profesors",
//                                 institution: "Kīmijas fakultāte",
//                                 voted_in_job:"yes",
//                                 start_date: "2010-01-14",
//                                 end_date: "2014-01-14"
//                             },
//                             {
//                                 id: 2,
//                                 academic_job_name: "Filozofijas profesors",
//                                 institution: "Filozofijas fakultāte",
//                                 voted_in_job: "no",
//                                 start_date: "2010-01-14",
//                                 end_date: "2014-01-14"
//                             },
//                             {
//                                 id: 3,
//                                 academic_job_name: "Datorikas profesors",
//                                 institution: "Datorikas fakultāte",
//                                 voted_in_job: "yes",
//                                 start_date: "2010-01-14",
//                                 end_date: "2014-01-14"
//                             }
//                     ];

//                     for (var i = 1; i <= 3; i++) {
//                         data.push(
//                             {
//                                 id: i,
//                                 name : 'Jānis',
//                                 surname : 'Bērziņš',
//                                 personal_code :'123123-12345',
//                                 academic_jobs_temp: academic_jobs_temp[i-1],
//                                 academic_jobs : [
//                                         {
//                                             id: 1,
//                                             academic_job_name: "Ķīmijas profesors",
//                                             institution: "Kīmijas fakultāte",
//                                             voted_in_job:"yes",
//                                             start_date: "2010-01-14",
//                                             end_date: "2014-01-14"
//                                         },
//                                         {
//                                             id: 2,
//                                             academic_job_name: "Filozofijas profesors",
//                                             institution: "Filozofijas fakultāte",
//                                             voted_in_job: "no",
//                                             start_date: "2010-01-14",
//                                             end_date: "2014-01-14"
//                                         },
//                                         {
//                                             id: 3,
//                                             academic_job_name: "Datorikas profesors",
//                                             institution: "Datorikas fakultāte",
//                                             voted_in_job: "yes",
//                                             start_date: "2010-01-14",
//                                             end_date: "2014-01-14"
//                                         }
//                                 ]
// //                                    year:"2015",
// //                                    hours:"330" + i,
// //                                    ple:"ple"+i
//                             }
//                         );
//                     }

//                     for (var i = 4; i <= 100; i++) {
//                         var random = Math.floor(Math.random() * 2) + 0;
//                         var temp =[academic_jobs_temp[random]];
//                         data.push(
//                             {
//                                 id: i,
//                                 name : 'name'+i,
//                                 surname : 'surname'+i,
//                                 personal_code :'123123-12345',
//                                 academic_jobs_temp: academic_jobs_temp[random],
//                                 academic_jobs : temp
// //                                    year:"2015",
// //                                    hours:"330" + i,
// //                                    ple:"ple"+i
//                             }
//                         );
//                     }
//                     total = data.length;
                    break;
                case 'FP_PIP':
                    // data = [];
                    // total = data.length;
                    break;
                case 'FP_PAK':
                    // data = [];
                    // total = data.length;
                    break;
                case 'FP_ZDR':
                    // data = [];
                    // total = data.length;
                    break;
            }

            return response;

        };

        return dataOp;

    }]);